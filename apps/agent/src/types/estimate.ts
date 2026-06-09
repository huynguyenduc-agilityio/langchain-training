import { VehicleType } from './trip';

export interface RideEstimate {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  options: {
    vehicleType: VehicleType;
    price: number;
  }[];
}
