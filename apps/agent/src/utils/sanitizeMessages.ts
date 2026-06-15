import { ToolMessage } from '@langchain/core/messages';

/**
 * Sanitize message history for OpenAI API compatibility.
 *
 * OpenAI requires every AIMessage tool_call to have a corresponding ToolMessage.
 * Frontend actions (handled by CopilotKit client-side) produce tool_calls but
 * no server-side ToolMessage response. This function inserts synthetic
 * ToolMessages after any orphan frontend action tool_calls.
 */
export function sanitizeMessages(
  messages: any[],
  frontendActionNames: Set<string>,
): any[] {
  // Collect all tool_call IDs that already have a ToolMessage
  const answeredIds = new Set<string>();
  for (const msg of messages) {
    const msgType =
      msg._getType?.() || msg.type || msg.constructor?.name?.toLowerCase();
    if (msgType === 'tool') {
      const id = msg.tool_call_id;
      if (id) answeredIds.add(id);
    }
  }

  // Insert synthetic ToolMessages after AIMessages with orphan tool_calls
  const result: any[] = [];
  for (const msg of messages) {
    result.push(msg);
    const msgType =
      msg._getType?.() || msg.type || msg.constructor?.name?.toLowerCase();
    if (msgType === 'ai' && msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        if (!answeredIds.has(tc.id) && frontendActionNames.has(tc.name)) {
          result.push(
            new ToolMessage({
              content: JSON.stringify({ status: 'displayed' }),
              tool_call_id: tc.id,
              name: tc.name,
            }),
          );
          answeredIds.add(tc.id);
        }
      }
    }
  }
  return result;
}

/**
 * Build a Set of frontend action names from CopilotKit state.
 */
export function getFrontendActionNames(state: any): Set<string> {
  return new Set(
    (state.copilotkit?.actions || []).map((a: any) => a.name),
  );
}
