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
  onConfirm?: () => void;
  onReject?: () => void;
};

export type CancelTripErrorCardProps = {
  tripId?: string;
  reason: string;
};
