import type { CARD_STATUS } from '@/constants';
import type { Trip, VehicleType } from '@repo/shared';

export type CancelSuccessCardProps = {
  tripId: string;
  pickup: string;
  destination: string;
  driverName?: string;
  price?: number;
  vehicleType?: VehicleType;
  passengerName?: string;
  passengerPhone?: string;
};

export type CancelTripCardProps = {
  tripId: string;
  pickup: string;
  destination: string;
  driverName?: string;
  disabled?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  status?:
    | typeof CARD_STATUS.PENDING
    | typeof CARD_STATUS.CONFIRMED
    | typeof CARD_STATUS.REJECTED
    | typeof CARD_STATUS.BYPASSED;
};

export type CancellableTripsSelectorCardProps = {
  trips: Trip[];
  disabled?: boolean;
  onSelectCancel: (tripId: string) => void;
  onBypass?: () => void;
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
  is_selection?: boolean;
  trips?: Trip[];
};

export type CancelConfirmResolveValue = {
  approved: boolean;
  cancelled?: boolean;
  selectedTripId?: string;
};
