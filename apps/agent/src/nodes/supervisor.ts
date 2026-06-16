import { ToolMessage } from '@langchain/core/messages';
import { RideBookingState } from '../state/state';

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
  const actions = state.copilotkit?.actions || [];
  const frontendActionNames = new Set(actions.map((a: any) => a.name));

  // Collect all tool_call IDs that already have a ToolMessage response
  const answeredToolCallIds = new Set<string>();
  for (const msg of messages) {
    if (
      (msg as any)._getType?.() === 'tool' ||
      (msg as any).type === 'tool' ||
      msg.constructor?.name === 'ToolMessage'
    ) {
      const toolCallId = (msg as any).tool_call_id;
      if (toolCallId) answeredToolCallIds.add(toolCallId);
    }
  }

  // Find AIMessages with frontend action tool_calls that are unanswered
  const syntheticMessages: ToolMessage[] = [];
  for (const msg of messages) {
    const isAI =
      (msg as any)._getType?.() === 'ai' ||
      (msg as any).type === 'ai' ||
      msg.constructor?.name === 'AIMessage';

    if (isAI) {
      const toolCalls = (msg as any).tool_calls || [];
      for (const tc of toolCalls) {
        if (
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
