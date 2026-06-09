import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '../state/state';
import { Trip } from '../types';
import { addTripToDb } from '../db/operations';
import { VALIDATION_MESSAGES } from '../constants';

/**
 * Process Tool Results Node
 *
 * Inspects the last message in the state. If it's a ToolMessage,
 * parses its content and updates state attributes appropriately.
 */
export async function processToolResults(
  state: RideBookingState,
  _config: RunnableConfig
) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as any;

  if (lastMessage && lastMessage._getType() === 'tool') {
    const toolMessage = lastMessage as any;
    const toolName = toolMessage.name;
    const toolContent = toolMessage.content;

    try {
      const parsed = typeof toolContent === 'string' ? JSON.parse(toolContent) : toolContent;

      if (toolName === 'estimateRide') {
        if (parsed.error === 'outside_service_area') {
          return {
            validationError: VALIDATION_MESSAGES.OUTSIDE_SERVICE_AREA_ERROR,
          };
        }
        if (parsed.error === 'distance_limit_exceeded') {
          return {
            validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
          };
        }
        return {
          rideEstimate: parsed,
          validationError: null,
        };
      }

      if (toolName === 'requestRide') {
        return {
          tripDraft: parsed.tripDraft,
        };
      }

      if (toolName === 'matchDriver') {
        const updatedTrips = state.userTrips.map((trip) => {
          if (trip.id === parsed.tripId) {
            return {
              ...trip,
              status: parsed.status,
              driver: parsed.driver,
            };
          }
          return trip;
        });
        return {
          userTrips: updatedTrips,
          tripDraft: null, // Clear draft as matching is complete
        };
      }

      if (toolName === 'cancelTrip') {
        const updatedTrips = state.userTrips.map((trip) => {
          if (trip.id === parsed.tripId) {
            return {
              ...trip,
              status: parsed.status,
              cancellationFee: parsed.cancellationFee,
              cancelledAt: parsed.cancelledAt,
            };
          }
          return trip;
        });
        return {
          userTrips: updatedTrips,
        };
      }

      if (toolName === 'lookupTrips') {
        return {
          userTrips: parsed.trips || [],
        };
      }

      // Handle frontend CopilotKit actions responses:
      if (toolName === 'showRideEstimate') {
        const selectedType = parsed.selectedVehicleType;
        if (state.rideEstimate && selectedType) {
          const option = state.rideEstimate.options.find(
            (o) => o.vehicleType === selectedType
          );
          const price = option ? option.price : 0;
          return {
            tripDraft: {
              pickup: state.rideEstimate.pickup,
              destination: state.rideEstimate.destination,
              distance: state.rideEstimate.distance,
              duration: state.rideEstimate.duration,
              vehicleType: selectedType,
              price: price,
              status: 'searching',
            },
          };
        }
      }

      if (toolName === 'showRideConfirm') {
        if (parsed.approved && state.tripDraft) {
          const newTrip: Trip = {
            id: parsed.tripId || `TRP-${Date.now()}`,
            pickup: state.tripDraft.pickup || '',
            destination: state.tripDraft.destination || '',
            distance: state.tripDraft.distance || 0,
            duration: state.tripDraft.duration || 0,
            vehicleType: state.tripDraft.vehicleType || 'bike',
            passengerName: state.tripDraft.passengerName || '',
            passengerPhone: state.tripDraft.passengerPhone || '',
            price: state.tripDraft.price || 0,
            status: 'searching',
            createdAt: new Date().toISOString(),
          };
          
          // Persist the trip to the database
          await addTripToDb(newTrip);

          return {
            userTrips: [newTrip, ...state.userTrips],
            tripDraft: newTrip, // Keep reference in draft for driver matching
          };
        } else {
          // Reset if rejected
          return {
            tripDraft: null,
            rideEstimate: null,
          };
        }
      }
    } catch (error) {
      console.error(`[ProcessToolResults] Error parsing tool response from ${toolName}:`, error);
    }
  }

  return {};
}
