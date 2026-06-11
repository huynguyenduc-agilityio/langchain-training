import { VEHICLE_TYPES } from '../constants';

export type TripStatus = 'searching' | 'matched' | 'picked_up' | 'completed' | 'cancelled';
export type VehicleType = typeof VEHICLE_TYPES[number];

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
}
