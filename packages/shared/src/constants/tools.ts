export const COPILOT_TOOLS = {
  RIDE_ESTIMATE: {
    name: 'rideEstimate',
    description:
      'Display interactive fare choices and ride estimate to the user in a card.',
  },
  DRIVER_MATCH: {
    name: 'driverMatch',
    description: 'Display the driver matching outcome to the user in a card.',
  },
  CANCEL_RIDE: {
    name: 'cancelRide',
    description:
      'Display the result of a trip cancellation — success card or error card depending on the outcome.',
  },
  TRIPS_LIST: {
    name: 'tripsList',
    description: "Display the list of user's trips in a card.",
  },
} as const;

export const DISPLAY_TOOL_NAMES = new Set<string>([
  COPILOT_TOOLS.RIDE_ESTIMATE.name,
  COPILOT_TOOLS.DRIVER_MATCH.name,
  COPILOT_TOOLS.CANCEL_RIDE.name,
  COPILOT_TOOLS.TRIPS_LIST.name,
]);
