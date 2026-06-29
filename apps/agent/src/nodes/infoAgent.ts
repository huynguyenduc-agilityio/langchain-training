import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';

import {
  sanitizeMessages,
  getFrontendActionNames,
  getCleanConfig,
} from '@/utils';
import { RideBookingState } from '@/state';
import { INFO_AGENT_SYSTEM_PROMPT } from '@/prompts';
import { lookupTripsTool, retrieveKnowledgeTool } from '@/tools';
import { LLM_CONFIG } from '@/constants';

import { logError } from '@repo/logger';

const baseModel = new ChatOpenAI({
  model: LLM_CONFIG.DEFAULT_MODEL,
  temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
});

export async function infoAgentNode(
  state: RideBookingState,
  config: RunnableConfig,
) {
  const backendTools = [lookupTripsTool, retrieveKnowledgeTool];
  const frontendActions = convertActionsToDynamicStructuredTools(
    state.copilotkit?.actions ?? [],
  );

  const modelWithTools = baseModel.bindTools([
    ...backendTools,
    ...frontendActions,
  ]);

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
      getCleanConfig(config),
    );

    return {
      messages: response,
    };
  } catch (error) {
    logError(error, '[InfoAgent] Error during LLM invocation:');
    return {
      messages: new AIMessage({
        content:
          "I'm sorry, I encountered an error retrieving your information. Please try again in a moment.",
      }),
    };
  }
}
