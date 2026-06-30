import { ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';
import { INTENT_TO_FLOW } from '@/constants';

export async function supervisorNode(state: RideBookingState) {
  const messages = state.messages || [];
  const actions = (state.copilotkit?.actions || []) as CopilotKitAction[];
  const frontendActionNames = new Set(actions.map((a) => a.name));

  // Collect all tool_call IDs that already have a ToolMessage response
  const answeredToolCallIds = new Set<string>();
  for (const msg of messages) {
    const msgType =
      msg._getType?.() || msg.type || msg.constructor?.name?.toLowerCase();
    if (msgType === 'tool') {
      const toolCallId = (msg as ToolMessage).tool_call_id;
      if (toolCallId) answeredToolCallIds.add(toolCallId);
    }
  }

  // Find AIMessages with frontend action tool_calls that are unanswered
  const syntheticMessages: ToolMessage[] = [];
  for (const msg of messages) {
    const msgType =
      msg._getType?.() || msg.type || msg.constructor?.name?.toLowerCase();

    if (msgType === 'ai') {
      const toolCalls = (msg as AIMessage).tool_calls || [];
      for (const tc of toolCalls) {
        if (
          tc.id &&
          frontendActionNames.has(tc.name) &&
          !answeredToolCallIds.has(tc.id)
        ) {
          syntheticMessages.push(
            new ToolMessage({
              content: JSON.stringify({ status: 'displayed' }),
              tool_call_id: tc.id,
              name: tc.name,
            }),
          );
          answeredToolCallIds.add(tc.id);
        }
      }
    }
  }

  const category = state.intent?.category || 'unknown';
  let activeFlow = state.activeFlow ?? null;

  const targetFlow = INTENT_TO_FLOW[category];
  if (targetFlow !== null) {
    activeFlow = targetFlow;
  }

  if (syntheticMessages.length > 0) {
    return { messages: syntheticMessages, activeFlow };
  }

  return { activeFlow };
}
