import { RunnableConfig } from '@langchain/core/runnables';
import { BaseStore } from '@langchain/langgraph';
import { StructuredTool } from '@langchain/core/tools';

import { COPILOT_TOOLS } from '@repo/shared';
import { RIDE_AGENT_SYSTEM_PROMPT } from '@/prompts/index';
import {
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
  dummyRideConfirmTool,
  retrieveKnowledgeTool,
} from '@/tools';
import {
  getUserFromState,
  readUserMemory,
  isTripApproved,
  createAgentNode,
} from '@/utils';
import { UserMemory } from '@/types';
import { getUserPhoneFromDb } from '@/db/operations';

export const rideAgentNode = createAgentNode({
  logPrefix: '[RideAgent]',
  fallbackMessage:
    "I'm sorry, I encountered an error processing your ride request. Please try again in a moment.",
  excludeFrontendActions: [
    COPILOT_TOOLS.RIDE_ESTIMATE.name,
    COPILOT_TOOLS.DRIVER_MATCH.name,
  ],
  getBackendTools: async (state) => {
    const tripApproved = isTripApproved(
      state.messages || [],
      !!state.tripDraft,
    );
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

    return backendTools;
  },
  getSystemPrompt: async (state, config) => {
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

    return RIDE_AGENT_SYSTEM_PROMPT(state, userPhone, userMemory);
  },
});
