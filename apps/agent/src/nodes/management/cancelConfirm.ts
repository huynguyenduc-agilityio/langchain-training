import { Command, interrupt, END } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { updateTripInDb, getTripFromDb } from '@/db/operations';
import { VEHICLE_BIKE, AGENT_TOOLS } from '@/constants';
import {
  COPILOT_TOOLS,
  CancelConfirmResult,
  CANCELLATION_FEE_CONFIG,
  Trip,
} from '@repo/shared';

/**
 * Cancellation Confirmation Node
 * Pauses graph execution using native interrupt, warns about fees,
 * updates state, and generates render messages directly upon approval.
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

  // Retrieve last tool message to parse tool results
  const lastToolMessage = [...messages]
    .reverse()
    .find(
      (m) =>
        (m._getType?.() || m.type || m.constructor?.name?.toLowerCase()) ===
          'tool' && (m as ToolMessage).name === AGENT_TOOLS.CANCEL_TRIP.name,
    ) as ToolMessage | undefined;

  let isSelection = false;
  let activeTrips: Trip[] = [];
  if (lastToolMessage) {
    try {
      const content =
        typeof lastToolMessage.content === 'string'
          ? JSON.parse(lastToolMessage.content)
          : lastToolMessage.content;
      if (content && typeof content === 'object') {
        isSelection = !!content.is_selection;
        activeTrips = content.trips || [];
      }
    } catch {
      // Ignore
    }
  }

  // Lookup trip details from state or DB if tripId is provided
  let trip = state.userTrips.find((t) => t.id === tripId);
  if (!trip && tripId) {
    trip = await getTripFromDb(tripId);
  }
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
      is_selection: isSelection,
      trips: activeTrips,
    },
  }) as CancelConfirmResult & { selectedTripId?: string };

  const finalTripId = result?.selectedTripId || tripId;

  if (result && result.approved && finalTripId) {
    let finalTrip = trip;
    let finalFee = cancellationFee;

    if (finalTripId !== tripId) {
      finalTrip = await getTripFromDb(finalTripId);
      const isMatched = !!finalTrip?.driver;
      finalFee = isMatched
        ? CANCELLATION_FEE_CONFIG[finalTrip?.vehicleType || VEHICLE_BIKE]
        : 0;
    }

    // Mutate DB immediately in the node to ensure state consistency
    await updateTripInDb(finalTripId, {
      status: 'cancelled',
      cancellationFee: finalFee,
      cancelledAt: new Date().toISOString(),
    });

    const updatedUserTrips = state.userTrips.map((t) =>
      t.id === finalTripId
        ? {
            ...t,
            status: 'cancelled' as const,
            cancellationFee: finalFee,
            cancelledAt: new Date().toISOString(),
          }
        : t,
    );

    // Generate render cancel success messages
    const toolCallId = `call_render_cancel_${Date.now()}`;
    const renderAiMsg = new AIMessage({
      content: '',
      tool_calls: [
        {
          id: toolCallId,
          name: COPILOT_TOOLS.CANCEL_RIDE.name,
          args: {
            success: true,
            tripId: finalTripId,
            pickup: finalTrip?.pickup || '',
            destination: finalTrip?.destination || '',
            cancellationFee: finalFee,
            reason: '',
          },
        },
      ],
    });
    const renderToolMsg = new ToolMessage({
      tool_call_id: toolCallId,
      name: COPILOT_TOOLS.CANCEL_RIDE.name,
      content: JSON.stringify({ displayed: true }),
    });

    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CANCEL_TRIP.name,
            content: JSON.stringify({
              approved: true,
              selectedTripId: finalTripId,
            }),
            tool_call_id: toolCall?.id || '',
          }),
          renderAiMsg,
          renderToolMsg,
        ],
        userTrips: updatedUserTrips,
        cancellationResult: null,
      },
      goto: END,
    });
  } else {
    const isExplicitCancel = Boolean(result && result.cancelled);
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CANCEL_TRIP.name,
            content: JSON.stringify({
              approved: false,
              cancelled: isExplicitCancel,
            }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
      },
      goto: isExplicitCancel ? 'agent' : END,
    });
  }
}
