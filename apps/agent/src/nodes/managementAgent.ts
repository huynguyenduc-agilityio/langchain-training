import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '../state/state';
import { MANAGEMENT_AGENT_SYSTEM_PROMPT } from '../prompts/index';
import { cancelTripTool, lookupTripsTool } from '../tools/index';
import { LLM_CONFIG } from '../constants';

export async function managementAgentNode(state: RideBookingState, config: RunnableConfig) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
  });

  const backendTools = [cancelTripTool, lookupTripsTool];
  const frontendActions = convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []);

  const modelWithTools = model.bindTools([...backendTools, ...frontendActions]);

  const systemMessage = new SystemMessage({
    content: MANAGEMENT_AGENT_SYSTEM_PROMPT(state),
  });

  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config
  );

  return {
    messages: response,
  };
}
