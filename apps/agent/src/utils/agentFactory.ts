import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';

import { logError } from '@repo/logger';
import { LLM_CONFIG } from '@/constants';
import { RideBookingState } from '@/state';
import {
  sanitizeMessages,
  getFrontendActionNames,
  getCleanConfig,
} from '@/utils';

const baseModel = new ChatOpenAI({
  model: LLM_CONFIG.DEFAULT_MODEL,
  temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
});

export interface AgentConfig {
  getSystemPrompt: (
    state: RideBookingState,
    config: RunnableConfig,
  ) => string | Promise<string>;
  getBackendTools: (
    state: RideBookingState,
    config: RunnableConfig,
  ) => StructuredTool[] | Promise<StructuredTool[]>;
  excludeFrontendActions?: string[];
  fallbackMessage: string;
  logPrefix: string;
}

export function createAgentNode(agentConfig: AgentConfig) {
  return async function agentNode(
    state: RideBookingState,
    config: RunnableConfig,
  ) {
    try {
      const backendTools = await agentConfig.getBackendTools(state, config);
      const frontendActions = convertActionsToDynamicStructuredTools(
        state.copilotkit?.actions ?? [],
      );

      const excludeSet = new Set(agentConfig.excludeFrontendActions || []);
      const filteredFrontendActions =
        excludeSet.size > 0
          ? frontendActions.filter((action) => !excludeSet.has(action.name))
          : frontendActions;

      const modelWithTools = baseModel.bindTools([
        ...backendTools,
        ...filteredFrontendActions,
      ]);

      const systemPromptContent = await agentConfig.getSystemPrompt(
        state,
        config,
      );
      const systemMessage = new SystemMessage({
        content: systemPromptContent,
      });

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
      logError(error, `${agentConfig.logPrefix} Error during LLM invocation:`);
      return {
        messages: new AIMessage({
          content: agentConfig.fallbackMessage,
        }),
      };
    }
  };
}
