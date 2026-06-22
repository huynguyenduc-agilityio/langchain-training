export const COPILOT_SUGGESTIONS = [
  {
    title: 'Request a ride',
    message: 'I want to request a ride',
  },
  {
    title: 'View my trips',
    message: 'Show me my trip history',
  },
  {
    title: 'Cancel a trip',
    message: 'I want to cancel a trip',
  },
];

export const THREAD_ID_KEY = 'cityride_chat_thread_id';

export const COPILOTKIT_AGENT_ID = process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_ID || 'default';
