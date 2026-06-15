import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { sanitizeMessages, getFrontendActionNames } from '../utils/sanitizeMessages';
import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '../state/state';
import { INFO_AGENT_SYSTEM_PROMPT } from '../prompts/index';
import { lookupTripsTool } from '../tools/index';
import { LLM_CONFIG } from '../constants';

export async function infoAgentNode(
  state: RideBookingState,
  config: RunnableConfig,
) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
  });

  const backendTools = [lookupTripsTool];
  const frontendActions = convertActionsToDynamicStructuredTools(
    state.copilotkit?.actions ?? [],
  );

  const modelWithTools = model.bindTools([...backendTools, ...frontendActions]);

  const systemMessage = new SystemMessage({
    content: INFO_AGENT_SYSTEM_PROMPT(state),
  });

  try {
    const sanitizedMessages = sanitizeMessages(
      state.messages || [],
      getFrontendActionNames(state),
    );

    const response = await modelWithTools.invoke(
      [systemMessage, ...sanitizedMessages],
      config,
    );

    return {
      messages: response,
    };
  } catch (error) {
    console.error('[InfoAgent] Error during LLM invocation:', error);
    return {
      messages: new AIMessage({
        content: 'I\'m sorry, I encountered an error retrieving your information. Please try again in a moment.',
      }),
    };
  }
}
