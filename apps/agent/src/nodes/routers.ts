import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';
import { AGENT_TOOLS } from '@/constants';

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

  // State-aware context routing: if we have an active trip draft or ride estimate in progress
  // and the user input is classified as unknown/chitchat (e.g. providing name, phone, or saying "yes"),
  // force route it to ride_agent to avoid losing the booking context.
  if (
    (state.tripDraft !== null || state.rideEstimate !== null) &&
    category === 'unknown'
  ) {
    category = 'request';
  }

  // Prevent infinite loops: if the last message is an AI response without tool calls,
  // or with only frontend action tool calls (already handled by CopilotKit client-side),
  // a subgraph has finished responding to the user — end the conversation turn.
  const messages = state.messages || [];
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
      const allAreFrontendActions = toolCalls.every((tc) =>
        frontendActionNames.has(tc.name),
      );
      if (allAreFrontendActions) {
        return '__end__';
      }
    }

    // If the last message is a ToolMessage corresponding to a frontend action
    // (which means it's a synthetic response to a frontend tool call), treat as end.
    if (isTool) {
      const toolName = (lastMessage as ToolMessage).name;
      const actions = (state.copilotkit?.actions || []) as CopilotKitAction[];
      const frontendActionNames = new Set(actions.map((a) => a.name));
      if (toolName && frontendActionNames.has(toolName)) {
        return '__end__';
      }
    }
  }

  switch (category) {
    case 'estimate':
    case 'request':
      return 'ride_agent';
    case 'cancel':
      return 'management_agent';
    case 'view_trips':
    case 'faq':
      return 'info_agent';
    case 'unknown':
    default:
      return 'info_agent'; // Default info agent to handle chitchat or help
  }
}

/**
 * General Routing logic for Info Agent:
 * Routes backend tools to tool_node, and other actions to __end__.
 */
export function routeAfterChat(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage && lastMessage.tool_calls?.length) {
    const actions = state.copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls[0].name;

    // If it's a frontend action, CopilotKit will execute it on the client side.
    // We only route to tool_node if it's a backend tool.
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  return '__end__';
}

/**
 * Routing logic for Ride Agent:
 * Routes showRideConfirm to the ride_confirm interrupt node, backend tools to tool_node,
 * and other actions to __end__.
 */
export function routeRideAgent(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage && lastMessage.tool_calls?.length) {
    const toolCallName = lastMessage.tool_calls[0].name;

    if (toolCallName === AGENT_TOOLS.CONFIRM_RIDE.name) {
      return 'ride_confirm';
    }

    const actions = state.copilotkit?.actions;
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  return '__end__';
}

/**
 * Routing logic for Management Agent:
 * Routes showCancelConfirm to the cancel_confirm interrupt node, backend tools to tool_node,
 * and other actions to __end__.
 */
export function routeManagementAgent(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage && lastMessage.tool_calls?.length) {
    const toolCallName = lastMessage.tool_calls[0].name;

    if (toolCallName === AGENT_TOOLS.CONFIRM_CANCEL.name) {
      return 'cancel_confirm';
    }

    const actions = state.copilotkit?.actions;
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  return '__end__';
}
