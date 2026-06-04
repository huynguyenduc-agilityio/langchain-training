import { AIMessage } from '@langchain/core/messages';
import { CustomerSupportState } from '../state/index';

/**
 * Router — determines the next step based on the LLM response.
 *
 * Routes to tool_node for backend tools, or ends for frontend actions / no tools.
 */
export function routeAfterChat({ messages, copilotkit }: CustomerSupportState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, route to tool node
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls[0].name;

    console.log(`Tool call: ${toolCallName}`);

    // Only route to tool node if it's NOT a frontend action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  // Otherwise, end the conversation
  return '__end__';
}
