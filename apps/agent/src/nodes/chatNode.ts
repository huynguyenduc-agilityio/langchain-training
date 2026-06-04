import { RunnableConfig } from '@langchain/core/runnables';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { CustomerSupportState } from '../state/index';
import { tools } from '../tools/index';
import { CHAT_NODE_SYSTEM_PROMPT } from '../prompts/index';

/**
 * Chat node — invokes the LLM with tools and customer support context.
 *
 * Binds both backend tools and frontend CopilotKit actions dynamically.
 */
export async function chatNode(
  state: CustomerSupportState,
  config: RunnableConfig,
) {
  console.log('\n=== CHAT NODE ===');

  // Initialize the model
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });

  // Bind ALL tools (customer support tools + frontend actions from CopilotKit)
  const modelWithTools = model.bindTools([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  // Create system message with customer support context
  const systemMessage = new SystemMessage({
    content: CHAT_NODE_SYSTEM_PROMPT(state),
  });

  // Invoke the model
  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config,
  );

  console.log('Model response generated');

  return {
    messages: response,
  };
}
