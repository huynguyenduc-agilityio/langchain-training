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
  _config: RunnableConfig,
) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as any;

  if (lastMessage && lastMessage._getType() === 'tool') {
    const toolMessage = lastMessage as any;
    const toolName = toolMessage.name;
    const toolContent = toolMessage.content;

    try {
      const parsed =
        typeof toolContent === 'string' ? JSON.parse(toolContent) : toolContent;

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
        if (parsed.error === 'ambiguous_location') {
          // Let the LLM see the error message and ask the user for clarification
          return {};
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
        if (parsed.success === false) {
          // If matching failed, do not update userTrips or clear draft in graph state.
          // Allow the LLM to get the error tool output and handle it.
          return {};
        }
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
    } catch (error) {
      console.error(
        `[ProcessToolResults] Error parsing tool response from ${toolName}:`,
        error,
      );
    }
  }

  return {};
}
