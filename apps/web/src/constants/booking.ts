export const CARD_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  BYPASSED: 'bypassed',
} as const;

export type CardStatus = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];
