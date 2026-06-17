import { RideBookingState } from '@/state';
import { CopilotKitContextItem, StateUser } from '@/types';

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
