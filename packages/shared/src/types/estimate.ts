import { VehicleType } from './trip';

export interface RideEstimate {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  options: {
    vehicleType: VehicleType;
    price: number;
  }[];
}

export type EstimateRideResult =
  | RideEstimate
  | { error: 'outside_service_area'; location: string }
  | { error: 'ambiguous_location'; message: string }
  | { error: 'distance_limit_exceeded'; distance: number };
