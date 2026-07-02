import type { Driver, Trip, VehicleType } from '@repo/shared';
import type { CARD_STATUS } from '@/constants';

export type RideConfirmCardProps = {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  vehicleType: VehicleType;
  passengerName: string;
  passengerPhone: string;
  price: number;
  disabled?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  status?:
    | typeof CARD_STATUS.PENDING
    | typeof CARD_STATUS.CONFIRMED
    | typeof CARD_STATUS.CANCELLED
    | typeof CARD_STATUS.BYPASSED;
};

export type RideEstimateCardProps = {
  toolCallId?: string;
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  options: {
    vehicleType: VehicleType;
    price: number;
  }[];
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export type RouteQuickSearchProps = {
  onEstimate?: (pickup: string, destination: string) => void;
};

export type DriverMatchCardProps = {
  tripId: string;
  driver: Driver;
  etaMinutes: number;
  /** Called once when the card first mounts — used to sync trips state upstream. */
  onMount?: () => void;
};

export type DriverMatchErrorCardProps = {
  tripId: string;
  reason: string;
};

export type TripDashboardProps = {
  trips: Trip[];
  onCancelTrip?: (tripId: string) => void;
  onEstimateRide?: (pickup: string, destination: string) => void;
  onRefresh?: () => void;
};

export type TripCardProps = {
  trip: Trip;
  index: number;
  onCancel?: (tripId: string) => void;
};

export type TripDetailDialogProps = {
  trip: Trip;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: (tripId: string) => void;
};

export type RideConfirmEventData = {
  pickup?: string;
  destination?: string;
  distance?: number;
  duration?: number;
  vehicleType?: 'bike' | 'car4' | 'car7';
  passengerName?: string;
  passengerPhone?: string;
  price?: number;
};

export type RideConfirmResolveValue = {
  approved: boolean;
  tripId?: string;
  cancelled?: boolean;
};
