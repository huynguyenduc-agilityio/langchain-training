import { BaseMessage, ToolMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { VALIDATION_MESSAGES, ERROR_CODES, AGENT_TOOLS } from '@/constants';

/**
 * Process Tool Results Node
 *
 * Inspects the last message in the state. If it's a ToolMessage,
 * parses its content and updates state attributes appropriately.
 */
export async function processToolResults(state: RideBookingState) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as BaseMessage | undefined;

  if (lastMessage && lastMessage._getType() === 'tool') {
    const toolMessage = lastMessage as ToolMessage;
    const toolName = toolMessage.name;
    const toolContent = toolMessage.content;

    try {
      const parsed =
        typeof toolContent === 'string' ? JSON.parse(toolContent) : toolContent;

      if (toolName === AGENT_TOOLS.ESTIMATE_RIDE.name) {
        if (parsed.error === ERROR_CODES.OUTSIDE_SERVICE_AREA) {
          return {
            validationError: VALIDATION_MESSAGES.OUTSIDE_SERVICE_AREA_ERROR,
          };
        }
        if (parsed.error === ERROR_CODES.DISTANCE_LIMIT_EXCEEDED) {
          return {
            validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
          };
        }
        if (parsed.error === ERROR_CODES.AMBIGUOUS_LOCATION) {
          // Let the LLM see the error message and ask the user for clarification
          return {};
        }
        return {
          rideEstimate: parsed,
          validationError: null,
        };
      }

      if (toolName === AGENT_TOOLS.REQUEST_RIDE.name) {
        return {
          tripDraft: parsed.tripDraft,
        };
      }

      if (toolName === AGENT_TOOLS.MATCH_DRIVER.name) {
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

      if (toolName === AGENT_TOOLS.LOOKUP_TRIPS.name) {
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
