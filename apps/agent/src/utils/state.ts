import { BaseMessage, ToolMessage } from '@langchain/core/messages';
import { RideBookingState } from '@/state';
import { CopilotKitContextItem, StateUser } from '@/types';
import { AGENT_TOOLS } from '@/constants';

/**
 * Extracts the authenticated user's profile from the CopilotKit context stored in the state.
 */
export function getUserFromState(state: RideBookingState) {
  const contextUser = state.copilotkit?.context?.find(
    (c: CopilotKitContextItem) =>
      c.description ===
      'The profile information of the currently authenticated user',
  )?.value;

  let userId: string | undefined;
  let name: string | undefined;
  let email: string | undefined;

  if (contextUser) {
    let parsedUser: StateUser | null = null;
    if (typeof contextUser === 'string') {
      try {
        parsedUser = JSON.parse(contextUser) as StateUser;
      } catch {
        userId = contextUser;
      }
    } else if (typeof contextUser === 'object' && contextUser !== null) {
      parsedUser = contextUser as StateUser;
    }

    if (parsedUser) {
      userId = parsedUser.id || parsedUser.uid;
      name = parsedUser.name || parsedUser.displayName;
      email = parsedUser.email;
    }
  }

  return { userId, name, email };
}

/**
 * Checks if the trip draft has been explicitly approved in the message history.
 */
export function isTripApproved(
  messages: BaseMessage[],
  hasDraft: boolean,
): boolean {
  if (!hasDraft) return false;

  let lastRequestRideIndex = -1;
  let lastConfirmRideApprovedIndex = -1;

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
    return lastConfirmRideApprovedIndex > lastRequestRideIndex;
  }
  return false;
}
