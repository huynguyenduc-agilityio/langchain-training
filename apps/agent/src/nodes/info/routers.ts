import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';
import { DISPLAY_TOOL_NAMES, COPILOT_TOOLS } from '@repo/shared';

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

    if (toolMsg.name === COPILOT_TOOLS.TRIPS_LIST.name) {
      return '__end__';
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
