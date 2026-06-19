export const COPILOT_TOOLS = {
  RENDER_RIDE_ESTIMATE: {
    name: 'renderRideEstimate',
    description:
      'Display interactive fare choices and ride estimate to the user in a card.',
  },
  CONFIRM_RIDE: {
    name: 'confirmRide',
    description: 'Display the final ride request details for user approval.',
  },
  MATCH_DRIVER: {
    name: 'matchDriver',
    description: 'Match a driver for a trip draft.',
  },
  CONFIRM_CANCEL: {
    name: 'confirmCancel',
    description: 'Display the cancellation confirmation details for a trip.',
  },
  RENDER_CANCEL_SUCCESS: {
    name: 'renderCancelSuccess',
    description:
      'Display a success card after a trip has been cancelled successfully.',
  },
  RENDER_CANCEL_ERROR: {
    name: 'renderCancelError',
    description: 'Display an error card after a trip cancellation fails.',
  },
  LOOKUP_TRIPS: {
    name: 'lookupTrips',
    description:
      "Lookup the current authenticated user's trips, or search by passenger phone number.",
  },
} as const;

// Tools that render a visible UI card in the chat — used to distinguish from data-only tools
export const DISPLAY_TOOL_NAMES = new Set<string>([
  COPILOT_TOOLS.RENDER_RIDE_ESTIMATE.name,
  COPILOT_TOOLS.CONFIRM_RIDE.name,
  COPILOT_TOOLS.MATCH_DRIVER.name,
  COPILOT_TOOLS.CONFIRM_CANCEL.name,
  COPILOT_TOOLS.RENDER_CANCEL_SUCCESS.name,
  COPILOT_TOOLS.RENDER_CANCEL_ERROR.name,
  COPILOT_TOOLS.LOOKUP_TRIPS.name,
]);
