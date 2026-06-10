import { RideBookingState } from '../state/state';

/**
 * Supervisor node that acts as a central control router/anchor.
 * Returns empty object as it is a pass-through node for conditional routing.
 */
export async function supervisorNode(state: RideBookingState) {
  return {};
}
