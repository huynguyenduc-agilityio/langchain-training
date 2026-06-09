import { RideBookingState } from '../state/state';

/**
 * Supervisor Router function
 * Inspects the classified intent and determines which sub-agent should run.
 */
export function supervisorRouter(state: RideBookingState) {
  const category = state.intent?.category || 'unknown';
  console.log(`[Supervisor] Routing category: ${category}`);

  if (state.validationError) {
    console.log('[Supervisor] Redirecting to error_response due to validation failure.');
    return 'error_response';
  }

  switch (category) {
    case 'estimate':
    case 'request':
      return 'ride_agent';
    case 'cancel':
      return 'management_agent';
    case 'view_trips':
    case 'faq':
      return 'info_agent';
    case 'unknown':
    default:
      return 'info_agent'; // Default info agent to handle chitchat or help
  }
}
