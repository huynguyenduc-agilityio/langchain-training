import { ChatOpenAI } from '@langchain/openai';
import { convertActionsToDynamicStructuredTools } from '@copilotkit/sdk-js/langgraph';
import {
  SystemMessage,
  AIMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';
import { BaseStore } from '@langchain/langgraph';

import { RideBookingState } from '@/state';
import { RIDE_AGENT_SYSTEM_PROMPT } from '@/prompts/index';
import {
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
  dummyRideConfirmTool,
  retrieveKnowledgeTool,
} from '@/tools';
import { LLM_CONFIG, AGENT_TOOLS } from '@/constants';
import {
  getUserFromState,
  readUserMemory,
  getCleanConfig,
  sanitizeMessages,
  getFrontendActionNames,
} from '@/utils';
import { UserMemory } from '@/types';
import { getUserPhoneFromDb } from '@/db/operations';

import { logError } from '@repo/logger';

const baseModel = new ChatOpenAI({
  model: LLM_CONFIG.DEFAULT_MODEL,
  temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
});

export async function rideAgentNode(
  state: RideBookingState,
  config: RunnableConfig,
) {
  // Verify if the current tripDraft has been explicitly approved in the message history
  let tripApproved = false;
  if (state.tripDraft) {
    let lastRequestRideIndex = -1;
    let lastConfirmRideApprovedIndex = -1;
    const messages = state.messages || [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgType =
        msg._getType?.() || msg.type || msg.constructor?.name?.toLowerCase();

      if (msgType === 'tool') {
        const toolMsg = msg as ToolMessage;
        if (toolMsg.name === AGENT_TOOLS.REQUEST_RIDE.name) {
          if (lastRequestRideIndex === -1) {
            lastRequestRideIndex = i;
          }
        }
        if (toolMsg.name === AGENT_TOOLS.CONFIRM_RIDE.name) {
          try {
            const content =
              typeof toolMsg.content === 'string'
                ? JSON.parse(toolMsg.content)
                : toolMsg.content;
            if (content?.approved === true) {
              if (lastConfirmRideApprovedIndex === -1) {
                lastConfirmRideApprovedIndex = i;
              }
            }
          } catch {
            // Ignore
          }
        }
      }
    }

    if (lastRequestRideIndex !== -1) {
      tripApproved = lastConfirmRideApprovedIndex > lastRequestRideIndex;
    }
  }

  const backendTools: StructuredTool[] = [
    estimateRideTool,
    requestRideTool,
    retrieveKnowledgeTool,
  ];

  if (tripApproved) {
    backendTools.push(matchDriverTool);
  }

  if (
    state.tripDraft &&
    state.tripDraft.passengerName &&
    state.tripDraft.passengerPhone
  ) {
    backendTools.push(dummyRideConfirmTool);
  }

  const frontendActions = convertActionsToDynamicStructuredTools(
    state.copilotkit?.actions ?? [],
  );

  const modelWithTools = baseModel.bindTools([
    ...backendTools,
    ...frontendActions,
  ]);

  const { userId } = getUserFromState(state);
  let userPhone: string | undefined = undefined;
  let userMemory: UserMemory | undefined = undefined;
  if (userId) {
    userPhone = await getUserPhoneFromDb(userId);
    const store = (config as RunnableConfig & { store?: BaseStore }).store;
    if (store) {
      try {
        userMemory = await readUserMemory(store, userId);
      } catch (err) {
        console.error('[RideAgentNode] Error reading user memory:', err);
      }
    }
  }

  const systemMessage = new SystemMessage({
    content: RIDE_AGENT_SYSTEM_PROMPT(state, userPhone, userMemory),
  });

  const sanitizedMessages = sanitizeMessages(
    state.messages || [],
    getFrontendActionNames(state),
  );

  try {
    const response = await modelWithTools.invoke(
      [systemMessage, ...sanitizedMessages],
      getCleanConfig(config),
    );

    return {
      messages: response,
    };
  } catch (error) {
    logError(error, '[RideAgent] Error during LLM invocation:');
    return {
      messages: new AIMessage({
        content:
          "I'm sorry, I encountered an error processing your ride request. Please try again in a moment.",
      }),
    };
  }
}
