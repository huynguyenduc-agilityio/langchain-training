import { BaseMessage, ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';
import { COPILOT_TOOLS } from '@repo/shared';
import { logError } from '@repo/logger';
import { LookupTripsResult, RetrieveKnowledgeResult } from '@/types';

/**
 * Handles LOOKUP_TRIPS tool results by rendering lists of trips if available.
 */
function handleLookupTripsResult(parsed: LookupTripsResult) {
  const trips = parsed.trips || [];

  // Guard: If empty, do not generate render messages, let LLM answer textually.
  if (trips.length === 0) {
    return {
      userTrips: [],
    };
  }

  // Generate trips list render messages
  const toolCallId = `call_render_trips_${Date.now()}`;
  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.TRIPS_LIST.name,
        args: {
          trips,
        },
      },
    ],
  });
  const renderToolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.TRIPS_LIST.name,
    content: JSON.stringify({ displayed: true }),
  });

  return {
    userTrips: trips,
    messages: [aiMessage, renderToolMessage],
  };
}

/**
 * Handles RETRIEVE_KNOWLEDGE tool results.
 */
function handleRetrieveKnowledgeResult(parsed: RetrieveKnowledgeResult) {
  return {
    retrievedDocuments: parsed.documents || [],
    retrievalQuery: parsed.query || null,
  };
}

/**
 * Process Info Tool Results Node
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
        case AGENT_TOOLS.LOOKUP_TRIPS.name:
          return handleLookupTripsResult(parsed as LookupTripsResult);
        case AGENT_TOOLS.RETRIEVE_KNOWLEDGE.name:
          return handleRetrieveKnowledgeResult(
            parsed as RetrieveKnowledgeResult,
          );
      }
    } catch (error) {
      logError(
        error,
        `[ProcessInfoToolResults] Error parsing tool response from ${toolName}:`,
      );
    }
  }

  return {};
}
