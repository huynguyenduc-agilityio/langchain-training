import { COPILOT_TOOLS } from '@repo/shared';
import { MANAGEMENT_AGENT_SYSTEM_PROMPT } from '@/prompts';
import {
  lookupTripsTool,
  cancelTripTool,
  retrieveKnowledgeTool,
} from '@/tools';
import { createAgentNode } from '@/utils';

export const managementAgentNode = createAgentNode({
  logPrefix: '[ManagementAgent]',
  fallbackMessage:
    "I'm sorry, I encountered an error processing your cancellation request. Please try again in a moment.",
  excludeFrontendActions: [COPILOT_TOOLS.CANCEL_RIDE.name],
  getBackendTools: () => [
    lookupTripsTool,
    cancelTripTool,
    retrieveKnowledgeTool,
  ],
  getSystemPrompt: (state) => MANAGEMENT_AGENT_SYSTEM_PROMPT(state),
});
