import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { COPILOT_TOOLS } from '@repo/shared';
import { RideBookingState } from '@/state';

/**
 * Deterministic Render Estimate Node
 *
 * Builds the rideEstimate AIMessage + ToolMessage pair directly
 * from state.rideEstimate — no LLM call. Data is 100% accurate.
 */
export async function renderEstimateNode(state: RideBookingState) {
  const est = state.rideEstimate;

  // Guard: no estimate or empty options → skip
  if (!est || !est.options?.length) {
    return {};
  }

  const toolCallId = `call_render_estimate_${Date.now()}`;

  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.RIDE_ESTIMATE.name,
        args: {
          pickup: est.pickup,
          destination: est.destination,
          distance: est.distance,
          duration: est.duration,
          options: est.options,
        },
      },
    ],
  });

  // Synthetic ToolMessage — prevents OpenAI API orphan tool_call error
  const toolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.RIDE_ESTIMATE.name,
    content: JSON.stringify({ displayed: true }),
  });

  return { messages: [aiMessage, toolMessage] };
}
