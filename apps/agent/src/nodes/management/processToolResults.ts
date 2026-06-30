import { BaseMessage, ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { AGENT_TOOLS } from '@/constants';
import { COPILOT_TOOLS } from '@repo/shared';
import { logError } from '@repo/logger';
import { CancelTripResult } from '@/types';

/**
 * Handles CANCEL_TRIP tool results by setting up render cancel screens.
 */
function handleCancelTripResult(parsed: CancelTripResult) {
  if (!parsed.success) {
    // Render failed cancellation screen
    const toolCallId = `call_render_cancel_${Date.now()}`;
    const aiMessage = new AIMessage({
      content: '',
      tool_calls: [
        {
          id: toolCallId,
          name: COPILOT_TOOLS.CANCEL_RIDE.name,
          args: {
            success: false,
            reason: parsed.reason || 'Cancellation check failed.',
          },
        },
      ],
    });
    const renderToolMessage = new ToolMessage({
      tool_call_id: toolCallId,
      name: COPILOT_TOOLS.CANCEL_RIDE.name,
      content: JSON.stringify({ displayed: true }),
    });

    return {
      cancellationResult: {
        success: false,
        reason: parsed.reason || 'Cancellation check failed.',
      },
      messages: [aiMessage, renderToolMessage],
    };
  }

  // If cancellation is successful and does not need confirm, render success immediately
  if (parsed.success && !parsed.needs_confirm) {
    const toolCallId = `call_render_cancel_${Date.now()}`;
    const aiMessage = new AIMessage({
      content: '',
      tool_calls: [
        {
          id: toolCallId,
          name: COPILOT_TOOLS.CANCEL_RIDE.name,
          args: {
            success: true,
            tripId: parsed.tripId || '',
            pickup: parsed.pickup || '',
            destination: parsed.destination || '',
            cancellationFee: parsed.cancellationFee || 0,
            reason: parsed.reason || '',
          },
        },
      ],
    });
    const renderToolMessage = new ToolMessage({
      tool_call_id: toolCallId,
      name: COPILOT_TOOLS.CANCEL_RIDE.name,
      content: JSON.stringify({ displayed: true }),
    });

    return {
      messages: [aiMessage, renderToolMessage],
    };
  }

  return {};
}

/**
 * Process Management Tool Results Node
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

      if (toolName === AGENT_TOOLS.CANCEL_TRIP.name) {
        return handleCancelTripResult(parsed as CancelTripResult);
      }
    } catch (error) {
      logError(
        error,
        `[ProcessMgmtToolResults] Error parsing tool response from ${toolName}:`,
      );
    }
  }

  return {};
}
