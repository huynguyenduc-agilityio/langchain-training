import { AIMessage, ToolMessage } from '@langchain/core/messages';

import { COPILOT_TOOLS } from '@repo/shared';
import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';

/**
 * Deterministic Render Match Driver Node
 *
 * Builds the driverMatch AIMessage + ToolMessage pair directly
 * from the matchDriver ToolMessage content — no LLM call.
 */
export async function renderMatchDriverNode(state: RideBookingState) {
  const messages = state.messages || [];
  const lastToolMsg = [...messages]
    .reverse()
    .find(
      (m) =>
        (m._getType?.() || m.type || m.constructor?.name?.toLowerCase()) ===
          'tool' && (m as ToolMessage).name === AGENT_TOOLS.MATCH_DRIVER.name,
    ) as ToolMessage | undefined;

  if (!lastToolMsg) {
    return {};
  }

  let result;
  try {
    result =
      typeof lastToolMsg.content === 'string'
        ? JSON.parse(lastToolMsg.content)
        : lastToolMsg.content;
  } catch (e) {
    console.error(
      '[renderMatchDriverNode] Error parsing matchDriver tool response:',
      e,
    );
    return {};
  }

  const toolCallId = `call_render_match_driver_${Date.now()}`;

  const aiMessage = new AIMessage({
    content: '',
    tool_calls: [
      {
        id: toolCallId,
        name: COPILOT_TOOLS.DRIVER_MATCH.name,
        args: {
          success: !!result.success,
          tripId: result.tripId || '',
          driver: result.driver || null,
          etaMinutes: result.etaMinutes || 0,
          error: result.error || null,
          message: result.message || null,
        },
      },
    ],
  });

  const toolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    name: COPILOT_TOOLS.DRIVER_MATCH.name,
    content: JSON.stringify({ displayed: true }),
  });

  return { messages: [aiMessage, toolMessage] };
}
