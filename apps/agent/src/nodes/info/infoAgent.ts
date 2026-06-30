import { COPILOT_TOOLS } from '@repo/shared';
import { INFO_AGENT_SYSTEM_PROMPT } from '@/prompts';
import { lookupTripsTool, retrieveKnowledgeTool } from '@/tools';
import { createAgentNode } from '@/utils';

export const infoAgentNode = createAgentNode({
  logPrefix: '[InfoAgent]',
  fallbackMessage:
    "I'm sorry, I encountered an error retrieving your information. Please try again in a moment.",
  excludeFrontendActions: [COPILOT_TOOLS.TRIPS_LIST.name],
  getBackendTools: () => [lookupTripsTool, retrieveKnowledgeTool],
  getSystemPrompt: (state) => INFO_AGENT_SYSTEM_PROMPT(state),
});
