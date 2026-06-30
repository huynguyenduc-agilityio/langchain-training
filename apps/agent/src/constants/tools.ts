export const AGENT_TOOLS = {
  ESTIMATE_RIDE: {
    name: 'estimateRide',
    description:
      'Calculate ride distance, duration, and price estimates between pickup and destination.',
  },
  REQUEST_RIDE: {
    name: 'requestRide',
    description:
      'Initiate a draft ride booking request once passenger details and vehicle selection are provided.',
  },
  MATCH_DRIVER: {
    name: 'matchDriver',
    description:
      'Start driver matching for an approved trip request. Finds the nearest available driver.',
  },
  LOOKUP_TRIPS: {
    name: 'lookupTrips',
    description:
      "Lookup the current authenticated user's trips, or search by passenger phone number.",
  },
  CANCEL_TRIP: {
    name: 'cancelTrip',
    description:
      'Initiate cancellation of a trip. Checks if the trip can be cancelled and calculates cancellation fees.',
  },
  RETRIEVE_KNOWLEDGE: {
    name: 'retrieveKnowledge',
    description:
      'Search the knowledge base for service FAQ, policies, location guides, and other reference information. Use when the user asks factual questions about the service.',
  },
  CONFIRM_RIDE: {
    name: 'confirmRide',
    description: 'Display the final ride request details for user approval.',
  },
} as const;
