import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { COPILOT_TOOLS } from '@repo/shared';
import { RideBookingState } from '@/state';

/**
 * Deterministic Render Cancel Node
 *
 * Builds the cancelRide AIMessage + ToolMessage pair directly
 * from state.cancellationResult — no LLM call.
 */
export async function renderCancelNode(state: RideBookingState) {
  const result = state.cancellationResult;

  if (!result) {
    return {};
  }

  const toolCallId = `call_render_cancel_${Date.now()}`;

  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.CANCEL_RIDE.name,
        args: {
          success: result.success,
          tripId: result.tripId || '',
          pickup: result.pickup || '',
          destination: result.destination || '',
          cancellationFee: result.cancellationFee || 0,
          reason: result.reason || '',
        },
      },
    ],
  });

  const toolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.CANCEL_RIDE.name,
    content: JSON.stringify({ displayed: true }),
  });

  // We clear cancellationResult in the return state updates so it doesn't trigger again
  return {
    messages: [aiMessage, toolMessage],
    cancellationResult: null,
  };
}
