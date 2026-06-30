import { Command, interrupt } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { updateTripInDb } from '@/db/operations';
import {
  CANCELLATION_FEE_CONFIG,
  VEHICLE_BIKE,
  AGENT_TOOLS,
} from '@/constants';
import { CancelConfirmResult } from '@/types';

/**
 * Cancellation Confirmation Node
 * Pauses graph execution using native interrupt, warns about fees,
 * and updates state using the Command pattern.
 */
export async function cancelConfirmNode(state: RideBookingState) {
  const messages = state.messages || [];
  const lastAiMessage = [...messages]
    .reverse()
    .find(
      (m) =>
        (m._getType?.() || m.type || m.constructor?.name?.toLowerCase()) ===
          'ai' && (m as AIMessage).tool_calls?.length,
    ) as AIMessage | undefined;
  const toolCall = lastAiMessage?.tool_calls?.[0];
  const tripId = toolCall?.args?.tripId;

  // Lookup trip details from state
  const trip = state.userTrips.find((t) => t.id === tripId);
  const driverMatched = !!trip?.driver;
  const vehicleType = trip?.vehicleType || VEHICLE_BIKE;
  const cancellationFee = driverMatched
    ? CANCELLATION_FEE_CONFIG[vehicleType]
    : 0;

  // Throws GraphInterrupt to pause execution, returns resume payload when resumed
  const result = interrupt({
    type: 'cancel_confirm',
    data: {
      tripId,
      pickup: trip?.pickup || '',
      destination: trip?.destination || '',
      driverName: trip?.driver?.name,
      cancellationFee,
    },
  }) as CancelConfirmResult;

  if (result && result.approved && tripId) {
    // Mutate DB immediately in the node to ensure state consistency
    await updateTripInDb(tripId, {
      status: 'cancelled',
      cancellationFee,
      cancelledAt: new Date().toISOString(),
    });

    const updatedUserTrips = state.userTrips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            status: 'cancelled' as const,
            cancellationFee,
            cancelledAt: new Date().toISOString(),
          }
        : t,
    );

    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CANCEL_TRIP.name,
            content: JSON.stringify({ approved: true }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
        userTrips: updatedUserTrips,
        cancellationResult: {
          success: true,
          tripId,
          pickup: trip?.pickup || '',
          destination: trip?.destination || '',
          cancellationFee,
        },
      },
      goto: 'render_cancel',
    });
  } else {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CANCEL_TRIP.name,
            content: JSON.stringify({ approved: false }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
      },
      goto: 'agent',
    });
  }
}
