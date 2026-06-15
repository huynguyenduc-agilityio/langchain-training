import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '../state/state';
import { RIDE_AGENT_SYSTEM_PROMPT } from '../prompts/index';
import { estimateRideTool, requestRideTool, matchDriverTool, dummyRideConfirmTool } from '../tools/index';
import { LLM_CONFIG } from '../constants';
import { sanitizeMessages, getFrontendActionNames } from '../utils/sanitizeMessages';

export async function rideAgentNode(state: RideBookingState, config: RunnableConfig) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
  });

  const backendTools = [estimateRideTool, requestRideTool, matchDriverTool];
  if (state.tripDraft && state.tripDraft.passengerName && state.tripDraft.passengerPhone) {
    backendTools.push(dummyRideConfirmTool);
  }

  const frontendActions = convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []);

  const modelWithTools = model.bindTools([...backendTools, ...frontendActions]);

  const systemMessage = new SystemMessage({
    content: RIDE_AGENT_SYSTEM_PROMPT(state),
  });

  const sanitizedMessages = sanitizeMessages(
    state.messages || [],
    getFrontendActionNames(state),
  );

  try {
    const response = await modelWithTools.invoke(
      [systemMessage, ...sanitizedMessages],
      config
    );

    return {
      messages: response,
    };
  } catch (error) {
    console.error('[RideAgent] Error during LLM invocation:', error);
    return {
      messages: new AIMessage({
        content: 'I\'m sorry, I encountered an error processing your ride request. Please try again in a moment.',
      }),
    };
  }
}
