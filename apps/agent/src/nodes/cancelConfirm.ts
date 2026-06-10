import { Command, interrupt } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '../state/state';

/**
 * Cancellation Confirmation Node
 * Pauses graph execution using native interrupt, warns about fees,
 * and updates state using the Command pattern.
 */
export async function cancelConfirmNode(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const toolCall = lastMessage.tool_calls?.[0];

  // Throws GraphInterrupt to pause execution, returns resume payload when resumed
  const result = interrupt({
    type: 'cancel_confirm',
    data: {
      tripId: toolCall?.args?.tripId,
      pickup: toolCall?.args?.pickup,
      destination: toolCall?.args?.destination,
      driverName: toolCall?.args?.driverName,
      cancellationFee: toolCall?.args?.cancellationFee,
    },
  }) as any;

  if (result && result.approved) {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || 'showCancelConfirm',
            content: JSON.stringify({ approved: true }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
      },
      goto: 'agent',
    });
  } else {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || 'showCancelConfirm',
            content: JSON.stringify({ approved: false }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
      },
      goto: 'agent',
    });
  }
}
