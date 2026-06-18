export const ERROR_MESSAGES = {
  GOOGLE_SIGNIN_FAILED: 'Failed to sign in with Google. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  DRIVER_NOT_FOUND:
    "We couldn't find any drivers matching your vehicle type nearby. All matching drivers are currently busy.",
};

export const CHATBOT_MESSAGES = {
  ERROR_FALLBACK: 'Oops, a wild bug appeared! Switching to fallback message 🐛',
} as const;
