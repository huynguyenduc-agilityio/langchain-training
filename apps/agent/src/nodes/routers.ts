import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';
import { DISPLAY_TOOL_NAMES } from '@repo/shared';
import { INTENT_TO_AGENT } from '@/constants';

/**
 * Router function for input validation.
 * Routes to error_response if validationError is set, otherwise routes to classify_intent.
 */
export function inputValidationRouter(state: RideBookingState) {
  if (state.validationError) {
    return 'error_response';
  }
  return 'classify_intent';
}

/**
 * Supervisor Router function
 * Inspects the classified intent and determines which sub-agent should run.
 */
export function supervisorRouter(state: RideBookingState) {
  let category = state.intent?.category || 'unknown';

  if (state.validationError) {
    return 'error_response';
  }

  const messages = state.messages || [];

  // State-aware context routing: if we have an active flow, trip draft, or ride estimate,
  // and the user input is classified as unknown/chitchat (e.g. "yes", providing name/phone),
  // force route it to the appropriate agent to avoid losing the conversation context.
  if (category === 'unknown') {
    if (
      state.activeFlow === 'ride' ||
      state.tripDraft !== null ||
      state.rideEstimate !== null
    ) {
      category = 'request';
    } else if (state.activeFlow === 'management') {
      category = 'cancel';
    } else if (state.activeFlow === 'info') {
      category = 'faq';
    }
  }

  // Prevent infinite loops: if the last message is an AI response without tool calls,
  // or with only frontend action tool calls (already handled by CopilotKit client-side),
  // a subgraph has finished responding to the user — end the conversation turn.
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    const msgType =
      lastMessage._getType?.() ||
      lastMessage.type ||
      lastMessage.constructor?.name?.toLowerCase();
    const isAI = msgType === 'ai';
    const isTool = msgType === 'tool';

    const toolCalls = isAI ? (lastMessage as AIMessage).tool_calls || [] : [];
    const hasToolCalls = toolCalls.length > 0;

    if (isAI && !hasToolCalls) {
      return '__end__';
    }

    // If all tool_calls are frontend actions (handled by CopilotKit), treat as end.
    if (isAI && hasToolCalls) {
      const actions = (state.copilotkit?.actions || []) as CopilotKitAction[];
      const frontendActionNames = new Set(actions.map((a) => a.name));
      const allAreFrontendActions = toolCalls.every(
        (tc) =>
          frontendActionNames.has(tc.name) || DISPLAY_TOOL_NAMES.has(tc.name),
      );
      if (allAreFrontendActions) {
        return '__end__';
      }
    }

    // If the last message is a ToolMessage corresponding to a frontend action
    // (which means it's a synthetic response to a frontend tool call), treat as end.
    if (isTool) {
      const toolMsg = lastMessage as ToolMessage;
      const toolName = toolMsg.name;
      const actions = (state.copilotkit?.actions || []) as CopilotKitAction[];
      const frontendActionNames = new Set(actions.map((a) => a.name));
      if (
        toolName &&
        (frontendActionNames.has(toolName) || DISPLAY_TOOL_NAMES.has(toolName))
      ) {
        return '__end__';
      }
    }
  }

  return INTENT_TO_AGENT[category];
}
