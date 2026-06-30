import { BaseMessage, ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { VALIDATION_MESSAGES, ERROR_CODES, AGENT_TOOLS } from '@/constants';
import { COPILOT_TOOLS } from '@repo/shared';
import { logError } from '@repo/logger';
import { EstimateRideResult } from '@repo/shared';
import { RequestRideResult, MatchDriverResult } from '@/types';

/**
 * Handles ESTIMATE_RIDE tool results by checking limits/errors and producing render messages.
 */
function handleEstimateRideResult(parsed: EstimateRideResult) {
  // If the result contains an error, process it and return early
  if ('error' in parsed && parsed.error) {
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
    // Generic fallback or AMBIGUOUS_LOCATION: Let LLM handle it
    return {};
  }

  // Generate estimate render messages
  const toolCallId = `call_render_estimate_${Date.now()}`;
  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.RIDE_ESTIMATE.name,
        args: {
          pickup: parsed.pickup,
          destination: parsed.destination,
          distance: parsed.distance,
          duration: parsed.duration,
          options: parsed.options,
        },
      },
    ],
  });
  const renderToolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.RIDE_ESTIMATE.name,
    content: JSON.stringify({ displayed: true }),
  });

  return {
    rideEstimate: parsed,
    validationError: null,
    messages: [aiMessage, renderToolMessage],
  };
}

/**
 * Handles REQUEST_RIDE tool results.
 */
function handleRequestRideResult(parsed: RequestRideResult) {
  return {
    tripDraft: parsed.tripDraft,
  };
}

/**
 * Handles MATCH_DRIVER tool results.
 */
function handleMatchDriverResult(
  parsed: MatchDriverResult,
  state: RideBookingState,
) {
  if (!parsed.success) {
    return {};
  }
  const updatedTrips = state.userTrips.map((trip) => {
    if (trip.id === parsed.tripId) {
      return {
        ...trip,
        status: parsed.status || 'matched',
        driver: parsed.driver,
      };
    }
    return trip;
  });

  // Generate driver match render messages
  const toolCallId = `call_render_match_driver_${Date.now()}`;
  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.DRIVER_MATCH.name,
        args: {
          success: !!parsed.success,
          tripId: parsed.tripId || '',
          driver: parsed.driver || null,
          etaMinutes: parsed.etaMinutes || 0,
          error: parsed.error || null,
          message: parsed.message || null,
        },
      },
    ],
  });
  const renderToolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.DRIVER_MATCH.name,
    content: JSON.stringify({ displayed: true }),
  });

  return {
    userTrips: updatedTrips,
    tripDraft: null,
    messages: [aiMessage, renderToolMessage],
  };
}

/**
 * Process Ride Tool Results Node
 * Delegates tool processing to specific helper functions.
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

      switch (toolName) {
        case AGENT_TOOLS.ESTIMATE_RIDE.name:
          return handleEstimateRideResult(parsed as EstimateRideResult);
        case AGENT_TOOLS.REQUEST_RIDE.name:
          return handleRequestRideResult(parsed as RequestRideResult);
        case AGENT_TOOLS.MATCH_DRIVER.name:
          return handleMatchDriverResult(parsed as MatchDriverResult, state);
      }
    } catch (error) {
      logError(
        error,
        `[ProcessRideToolResults] Error parsing tool response from ${toolName}:`,
      );
    }
  }

  return {};
}
