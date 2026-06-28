import { UiTerminalToolConfig } from '../types';

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
  RENDER_RIDE_ESTIMATE: {
    name: 'renderRideEstimate',
    description:
      'Display interactive fare choices and ride estimate to the user in a card.',
  },
  CONFIRM_RIDE: {
    name: 'confirmRide',
    description: 'Display the final ride request details for user approval.',
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
  RETRIEVE_KNOWLEDGE: {
    name: 'retrieveKnowledge',
    description:
      'Search the knowledge base for service FAQ, policies, location guides, and other reference information. Use when the user asks factual questions about the service.',
  },
} as const;

// Registry of backend tools that render a self-contained UI card and require
export const UI_TERMINAL_TOOLS: Record<string, UiTerminalToolConfig> = {
  [AGENT_TOOLS.LOOKUP_TRIPS.name]: { endOn: 'always' },
  [AGENT_TOOLS.MATCH_DRIVER.name]: { endOn: 'success' },
};
