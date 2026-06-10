import { Command, interrupt } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from '@langchain/core/messages';

import { RideBookingState } from '../state/state';
import { addTripToDb } from '../db/operations';
import { Trip } from '../types';

/**
 * Ride Confirmation Node
 * Pauses graph execution using native interrupt, waits for approval/cancellation,
 * and updates state using the Command pattern.
 */
export async function rideConfirmNode(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const toolCall = lastMessage.tool_calls?.[0];

  // Throws GraphInterrupt to pause execution, returns resume payload when resumed
  const result = interrupt({
    type: 'ride_confirm',
    data: state.tripDraft,
  }) as any;

  if (result && result.approved) {
    const newTripId = result.tripId || `TRP-${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      pickup: state.tripDraft?.pickup || '',
      destination: state.tripDraft?.destination || '',
      distance: state.tripDraft?.distance || 0,
      duration: state.tripDraft?.duration || 0,
      vehicleType: state.tripDraft?.vehicleType || 'bike',
      passengerName: state.tripDraft?.passengerName || '',
      passengerPhone: state.tripDraft?.passengerPhone || '',
      price: state.tripDraft?.price || 0,
      status: 'searching',
      createdAt: new Date().toISOString(),
    };

    // Save trip to database
    await addTripToDb(newTrip);

    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || 'showRideConfirm',
            content: JSON.stringify({ approved: true, tripId: newTripId }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
        userTrips: [newTrip, ...state.userTrips],
        tripDraft: newTrip,
      },
      goto: 'agent',
    });
  } else {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || 'showRideConfirm',
            content: JSON.stringify({ approved: false }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
        tripDraft: null,
        rideEstimate: null,
      },
      goto: 'agent',
    });
  }
}
