import { ToolMessage, AIMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { CopilotKitAction } from '@/types';

/**
 * Supervisor node that acts as a central control router/anchor.
 *
 * Also patches message history: when a subgraph ends with an AIMessage
 * containing frontend action tool_calls (handled by CopilotKit client-side),
 * those tool_calls have no corresponding ToolMessage. OpenAI API requires
 * every tool_call to have a ToolMessage response. This node injects synthetic
 * ToolMessages to prevent API errors on subsequent invocations.
 */
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

  if (syntheticMessages.length > 0) {
    return { messages: syntheticMessages };
  }

  return {};
}
