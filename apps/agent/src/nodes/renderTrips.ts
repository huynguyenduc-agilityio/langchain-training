import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { COPILOT_TOOLS } from '@repo/shared';
import { RideBookingState } from '@/state';

/**
 * Deterministic Render Trips Node
 *
 * Builds the tripsList AIMessage + ToolMessage pair directly
 * from state.userTrips — no LLM call.
 */
export async function renderTripsNode(state: RideBookingState) {
  const trips = state.userTrips || [];

  const toolCallId = `call_render_trips_${Date.now()}`;

  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.TRIPS_LIST.name,
        args: {
          trips,
        },
      },
    ],
  });

  const toolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.TRIPS_LIST.name,
    content: JSON.stringify({ displayed: true }),
  });

  return { messages: [aiMessage, toolMessage] };
}
