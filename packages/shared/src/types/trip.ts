export type TripStatus =
  | 'searching'
  | 'matched'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export type VehicleType = 'bike' | 'car4' | 'car7';

export interface Driver {
  name: string;
  phone: string;
  vehicleInfo: string;
  licensePlate: string;
  rating: number;
}

export interface Trip {
  id: string;
  userId: string;
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  vehicleType: VehicleType;
  passengerName: string;
  passengerPhone: string;
  price: number;
  status: TripStatus;
  driver?: Driver | null;
  createdAt: string;
  cancelledAt?: string;
  cancellationFee?: number;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
}

export interface CancelConfirmResult {
  approved: boolean;
  cancelled?: boolean;
}

export interface RideConfirmResult {
  approved: boolean;
  tripId?: string;
  cancelled?: boolean;
}

export interface RideRequestArgs {
  pickup: string;
  destination: string;
  vehicleType: VehicleType;
  passengerName: string;
  passengerPhone: string;
  price: number;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
}
