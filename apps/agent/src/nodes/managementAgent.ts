import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';

import {
  sanitizeMessages,
  getFrontendActionNames,
} from '@/utils/sanitizeMessages';
import { RideBookingState } from '@/state';
import { MANAGEMENT_AGENT_SYSTEM_PROMPT } from '@/prompts/index';
import { lookupTripsTool, dummyCancelConfirmTool } from '@/tools/index';
import { LLM_CONFIG } from '@/constants';

import { logError } from '@repo/logger';

export async function managementAgentNode(
  state: RideBookingState,
  config: RunnableConfig,
) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
  });

  const backendTools = [lookupTripsTool, dummyCancelConfirmTool];
  const frontendActions = convertActionsToDynamicStructuredTools(
    state.copilotkit?.actions ?? [],
  );

  const modelWithTools = model.bindTools([...backendTools, ...frontendActions]);

  const systemMessage = new SystemMessage({
    content: MANAGEMENT_AGENT_SYSTEM_PROMPT(state),
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
    logError(error, '[ManagementAgent] Error during LLM invocation:');
    return {
      messages: new AIMessage({
        content:
          "I'm sorry, I encountered an error processing your cancellation request. Please try again in a moment.",
      }),
    };
  }
}
