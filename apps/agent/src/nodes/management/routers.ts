import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';
import { DISPLAY_TOOL_NAMES, COPILOT_TOOLS } from '@repo/shared';

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
 * Router for Management Agent subgraph after process_results.
 */
export function routeAfterManagementToolResults(
  state: RideBookingState,
): 'cancel_confirm' | 'agent' | '__end__' {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  const msgType =
    lastMessage?._getType?.() ||
    lastMessage?.type ||
    lastMessage?.constructor?.name?.toLowerCase();

  if (msgType === 'tool') {
    const toolMsg = lastMessage as ToolMessage;

    if (toolMsg.name === COPILOT_TOOLS.CANCEL_RIDE.name) {
      return '__end__';
    }

    if (toolMsg.name === AGENT_TOOLS.CANCEL_TRIP.name) {
      try {
        const parsed =
          typeof toolMsg.content === 'string'
            ? JSON.parse(toolMsg.content)
            : toolMsg.content;

        if (parsed && parsed.success) {
          return 'cancel_confirm';
        }
      } catch {
        // Ignore
      }
    }
  }

  return 'agent';
}
