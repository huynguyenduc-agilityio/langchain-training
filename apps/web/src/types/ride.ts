export type TripStatus = 'searching' | 'matched' | 'picked_up' | 'completed' | 'cancelled';
export type VehicleType = 'bike' | 'car4' | 'car7';

export interface Driver {
  name: string;
  phone: string;
  vehicleInfo: string; // e.g. "Yamaha Exciter", "Toyota Vios"
  licensePlate: string;
  rating: number;
}

export interface Trip {
  id: string;              // "TRP-20260608-001"
  pickup: string;
  destination: string;
  distance: number;        // km
  duration: number;        // minutes
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

// Intent classification
export type RideIntent =
  | 'estimate'
  | 'request'
  | 'cancel'
  | 'view_trips'
  | 'faq'
  | 'unknown';
