import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';
import { AGENT_TOOLS, UI_TERMINAL_TOOLS } from '@/constants';

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
      const toolMsg = lastMessage as ToolMessage;
      const toolName = toolMsg.name;
      const actions = (state.copilotkit?.actions || []) as CopilotKitAction[];
      const frontendActionNames = new Set(actions.map((a) => a.name));
      if (toolName && frontendActionNames.has(toolName)) {
        return '__end__';
      }

      // UI-terminal tools render a self-contained card on the frontend.
      // Behavior (always vs success-only) is defined in the UI_TERMINAL_TOOLS registry.
      if (shouldEndAfterTool(toolMsg)) return '__end__';
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

/**
 * Checks whether routing should end immediately after a UI-terminal tool runs.
 * Behavior is driven by the UI_TERMINAL_TOOLS registry (constants/tools.ts):
 * - 'always'  → end regardless of tool result
 * - 'success' → end only when tool result contains { success: true }
 */
function shouldEndAfterTool(message: ToolMessage): boolean {
  const config = UI_TERMINAL_TOOLS[message.name ?? ''];
  if (!config) return false;

  if (config.endOn === 'always') return true;

  try {
    const content =
      typeof message.content === 'string'
        ? JSON.parse(message.content)
        : message.content;
    return content?.success === true;
  } catch {
    return false;
  }
}

/**
 * Generic router for after tool_node → process_results.
 * Routes to '__end__' if the last tool was a UI-terminal tool that should end,
 * otherwise routes back to 'agent' for LLM to continue the flow.
 *
 * Reusable across ride, management, and info subgraphs.
 */
export function routeAfterToolResults(
  state: RideBookingState,
): 'agent' | '__end__' {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  const msgType =
    lastMessage?._getType?.() ||
    lastMessage?.type ||
    lastMessage?.constructor?.name?.toLowerCase();

  if (msgType === 'tool') {
    if (shouldEndAfterTool(lastMessage as ToolMessage)) return '__end__';
  }

  return 'agent';
}

/**
 * Router for Info Agent subgraph after process_results.
 */
export function routeAfterInfoToolResults(
  state: RideBookingState,
): 'retrieval_grader' | 'agent' | '__end__' {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  const msgType =
    lastMessage?._getType?.() ||
    lastMessage?.type ||
    lastMessage?.constructor?.name?.toLowerCase();

  if (msgType === 'tool') {
    const toolMsg = lastMessage as ToolMessage;

    // Route retrieveKnowledge results to the grader
    if (toolMsg.name === AGENT_TOOLS.RETRIEVE_KNOWLEDGE.name) {
      return 'retrieval_grader';
    }

    if (shouldEndAfterTool(toolMsg)) return '__end__';
  }

  return 'agent';
}

/**
 * Router after retrieval grading.
 * - If documents are relevant → route back to agent to generate answer
 * - If not relevant and retries remaining → route to query_rewriter
 * - If max retries reached → route to agent anyway (let it handle gracefully)
 */
export function routeAfterGrading(
  state: RideBookingState,
): 'agent' | 'query_rewriter' {
  const MAX_RETRIES = 2;

  if (state.retrievalRelevant) {
    return 'agent';
  }

  if ((state.retrievalRetryCount || 0) >= MAX_RETRIES) {
    // Max retries reached — let the agent answer with whatever it has
    return 'agent';
  }

  return 'query_rewriter';
}
