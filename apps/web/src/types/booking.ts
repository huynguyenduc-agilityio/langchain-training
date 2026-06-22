import type { Driver, Trip, VehicleType } from './ride';

export type RideConfirmCardProps = {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  vehicleType: VehicleType;
  passengerName: string;
  passengerPhone: string;
  price: number;
  onConfirm?: () => void;
  onCancel?: () => void;
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
