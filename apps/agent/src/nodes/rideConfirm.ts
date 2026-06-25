import { Command, interrupt, END } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';

import { RideBookingState } from '@/state';
import { addTripToDb } from '@/db/operations';
import { Trip, RideConfirmResult, RideRequestArgs } from '@/types';
import {
  isWithinOperatingHours,
  hasTooManyActiveTrips,
  getUserFromState,
} from '@/utils';
import { VALIDATION_MESSAGES, VEHICLE_BIKE, AGENT_TOOLS } from '@/constants';

/**
 * Ride Confirmation Node
 * Pauses graph execution using native interrupt, waits for approval/cancellation,
 * and updates state using the Command pattern.
 */
export async function rideConfirmNode(
  state: RideBookingState,
  config?: RunnableConfig,
) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const toolCall = lastMessage.tool_calls?.[0];

  // Fallback to tool call arguments if tripDraft is null
  const draft =
    state.tripDraft ||
    (toolCall
      ? {
          pickup: toolCall.args.pickup,
          destination: toolCall.args.destination,
          distance: toolCall.args.distance,
          duration: toolCall.args.duration,
          vehicleType: toolCall.args.vehicleType,
          passengerName: toolCall.args.passengerName,
          passengerPhone: toolCall.args.passengerPhone,
          price: toolCall.args.price,
          status: 'searching',
        }
      : null);

  // Throws GraphInterrupt to pause execution, returns resume payload when resumed
  const result = interrupt({
    type: 'ride_confirm',
    data: draft,
  }) as RideConfirmResult;

  if (result && result.approved) {
    // Re-validate business rules at resumption step (concurrent conflict prevention)
    if (!isWithinOperatingHours()) {
      return new Command({
        update: {
          validationError: VALIDATION_MESSAGES.OPERATING_HOURS_ERROR,
        },
        goto: END,
      });
    }

    if (hasTooManyActiveTrips(state.userTrips)) {
      return new Command({
        update: {
          validationError: VALIDATION_MESSAGES.ACTIVE_TRIPS_LIMIT_ERROR,
        },
        goto: END,
      });
    }

    const {
      userId: contextUserId,
      name: userName,
      email: userEmail,
    } = getUserFromState(state);

    const userId =
      contextUserId ||
      config?.configurable?.copilotkit_properties?.userId ||
      config?.configurable?.userId;

    if (!userId) {
      throw new Error(
        'User ID is required but was not found in context or config.',
      );
    }

    const newTripId = result.tripId || `TRP-${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      userId,
      pickup: draft?.pickup || '',
      destination: draft?.destination || '',
      distance: draft?.distance || 0,
      duration: draft?.duration || 0,
      vehicleType: draft?.vehicleType || VEHICLE_BIKE,
      passengerName: draft?.passengerName || '',
      passengerPhone: draft?.passengerPhone || '',
      price: draft?.price || 0,
      status: 'searching',
      createdAt: new Date().toISOString(),
      pickupLat:
        state.rideEstimate?.pickupLat ||
        (toolCall?.args as unknown as RideRequestArgs)?.pickupLat,
      pickupLng:
        state.rideEstimate?.pickupLng ||
        (toolCall?.args as unknown as RideRequestArgs)?.pickupLng,
      destLat:
        state.rideEstimate?.destLat ||
        (toolCall?.args as unknown as RideRequestArgs)?.destLat,
      destLng:
        state.rideEstimate?.destLng ||
        (toolCall?.args as unknown as RideRequestArgs)?.destLng,
    };

    // Save trip to database
    await addTripToDb(newTrip, userName, userEmail);

    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CONFIRM_RIDE.name,
            content: JSON.stringify({ approved: true, tripId: newTripId }),
            tool_call_id: toolCall?.id || '',
          }),
        ],
        userTrips: [newTrip, ...state.userTrips],
        tripDraft: newTrip,
      },
      goto: 'memory_writer',
    });
  } else {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            name: toolCall?.name || AGENT_TOOLS.CONFIRM_RIDE.name,
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
