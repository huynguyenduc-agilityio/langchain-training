import { AIMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';

/**
 * Error response node for validation guardrail failures
 */
export async function errorResponseNode(state: RideBookingState) {
  return {
    messages: [
      new AIMessage({
        content:
          state.validationError ||
          'An unexpected validation error occurred. Please try again.',
      }),
    ],
  };
}
