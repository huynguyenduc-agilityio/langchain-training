import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';
import { AGENT_TOOLS } from '@/constants';
import { DISPLAY_TOOL_NAMES } from '@repo/shared';

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
    if (
      (!actions || actions.every((action) => action.name !== toolCallName)) &&
      !DISPLAY_TOOL_NAMES.has(toolCallName)
    ) {
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
    if (
      (!actions || actions.every((action) => action.name !== toolCallName)) &&
      !DISPLAY_TOOL_NAMES.has(toolCallName)
    ) {
      return 'tool_node';
    }
  }

  return '__end__';
}

/**
 * Routing logic for Management Agent:
 * Routes backend tools to tool_node, and other actions to __end__.
 */
export function routeManagementAgent(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage && lastMessage.tool_calls?.length) {
    const toolCallName = lastMessage.tool_calls[0].name;

    const actions = state.copilotkit?.actions;
    if (
      (!actions || actions.every((action) => action.name !== toolCallName)) &&
      !DISPLAY_TOOL_NAMES.has(toolCallName)
    ) {
      return 'tool_node';
    }
  }

  return '__end__';
}

/**
 * Generic router for after tool_node → process_results.
 * Reusable across ride, management, and info subgraphs.
 */
export function routeAfterToolResults(
  state: RideBookingState,
): 'render_estimate' | 'render_match_driver' | 'agent' | '__end__' {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  const msgType =
    lastMessage?._getType?.() ||
    lastMessage?.type ||
    lastMessage?.constructor?.name?.toLowerCase();

  if (msgType === 'tool') {
    const toolMsg = lastMessage as ToolMessage;

    if (toolMsg.name === AGENT_TOOLS.MATCH_DRIVER.name) {
      return 'render_match_driver';
    }

    if (
      toolMsg.name === AGENT_TOOLS.ESTIMATE_RIDE.name &&
      state.rideEstimate &&
      state.rideEstimate.options?.length
    ) {
      try {
        const parsed =
          typeof toolMsg.content === 'string'
            ? JSON.parse(toolMsg.content)
            : toolMsg.content;

        if (parsed && !parsed.error) {
          const aiMessages = messages.filter(
            (m) =>
              (m._getType?.() ||
                m.type ||
                m.constructor?.name?.toLowerCase()) === 'ai',
          );
          const lastAi = aiMessages[aiMessages.length - 1] as
            | AIMessage
            | undefined;
          const calledRequestRideToo = lastAi?.tool_calls?.some(
            (tc) => tc.name === AGENT_TOOLS.REQUEST_RIDE.name,
          );

          if (!calledRequestRideToo) {
            return 'render_estimate';
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  return 'agent';
}

/**
 * Router for Info Agent subgraph after process_results.
 */
export function routeAfterInfoToolResults(
  state: RideBookingState,
): 'retrieval_grader' | 'render_trips' | 'agent' | '__end__' {
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

    if (toolMsg.name === AGENT_TOOLS.LOOKUP_TRIPS.name) {
      return 'render_trips';
    }
  }

  return 'agent';
}

/**
 * Router for Management Agent subgraph after process_results.
 */
export function routeAfterManagementToolResults(
  state: RideBookingState,
): 'cancel_confirm' | 'render_cancel' | 'agent' {
  if (state.cancellationResult) {
    return 'render_cancel';
  }

  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  const msgType =
    lastMessage?._getType?.() ||
    lastMessage?.type ||
    lastMessage?.constructor?.name?.toLowerCase();

  if (msgType === 'tool') {
    const toolMsg = lastMessage as ToolMessage;
    if (toolMsg.name === AGENT_TOOLS.CANCEL_TRIP.name) {
      try {
        const parsed =
          typeof toolMsg.content === 'string'
            ? JSON.parse(toolMsg.content)
            : toolMsg.content;
        if (parsed && parsed.success && parsed.needs_confirm) {
          return 'cancel_confirm';
        }
      } catch {
        // Ignore
      }
    }
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
