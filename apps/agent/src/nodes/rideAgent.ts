import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '../state/state';
import { RIDE_AGENT_SYSTEM_PROMPT } from '../prompts/index';
import { estimateRideTool, requestRideTool, matchDriverTool } from '../tools/index';

export async function rideAgentNode(state: RideBookingState, config: RunnableConfig) {
  console.log('\n=== RIDE AGENT NODE ===');

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });

  const backendTools = [estimateRideTool, requestRideTool, matchDriverTool];
  const frontendActions = convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []);

  const modelWithTools = model.bindTools([...backendTools, ...frontendActions]);

  const systemMessage = new SystemMessage({
    content: RIDE_AGENT_SYSTEM_PROMPT(state),
  });

  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config
  );

  return {
    messages: response,
  };
}
