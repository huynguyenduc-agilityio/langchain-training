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
