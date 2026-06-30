import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';
import { DISPLAY_TOOL_NAMES, COPILOT_TOOLS } from '@repo/shared';

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
 * Router for after tool_node → process_results.
 * Routes to __end__ if a render tool message has been appended, otherwise routes back to agent.
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
    const toolMsg = lastMessage as ToolMessage;

    if (
      toolMsg.name === COPILOT_TOOLS.RIDE_ESTIMATE.name ||
      toolMsg.name === COPILOT_TOOLS.DRIVER_MATCH.name
    ) {
      return '__end__';
    }
  }

  return 'agent';
}
