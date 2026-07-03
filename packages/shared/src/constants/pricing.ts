import { VehicleType } from '../types/trip';

export const VEHICLE_BIKE = 'bike' as const;
export const VEHICLE_CAR4 = 'car4' as const;
export const VEHICLE_CAR7 = 'car7' as const;

export const PRICING_CONFIG: Record<
  VehicleType,
  { base: number; perKm: number }
> = {
  [VEHICLE_BIKE]: { base: 1.0, perKm: 0.5 },
  [VEHICLE_CAR4]: { base: 2.5, perKm: 1.0 },
  [VEHICLE_CAR7]: { base: 4.0, perKm: 1.5 },
} as const;
