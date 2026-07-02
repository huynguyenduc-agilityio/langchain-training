import type { CARD_STATUS } from '@/constants';

export type CancelSuccessCardProps = {
  tripId: string;
  pickup: string;
  destination: string;
  cancellationFee: number;
};

export type CancelTripCardProps = {
  tripId: string;
  pickup: string;
  destination: string;
  driverName?: string;
  cancellationFee?: number;
  disabled?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  status?:
    | typeof CARD_STATUS.PENDING
    | typeof CARD_STATUS.CONFIRMED
    | typeof CARD_STATUS.REJECTED
    | typeof CARD_STATUS.BYPASSED;
};

export type CancelTripErrorCardProps = {
  tripId?: string;
  reason: string;
};

export type CancelConfirmEventData = {
  tripId?: string;
  pickup?: string;
  destination?: string;
  driverName?: string;
  cancellationFee?: number;
};

export type CancelConfirmResolveValue = {
  approved: boolean;
  cancelled?: boolean;
};
