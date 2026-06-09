import { VEHICLE_BIKE, VEHICLE_CAR4, VEHICLE_CAR7 } from './vehicles';

export const PRICING_CONFIG = {
  [VEHICLE_BIKE]: { base: 1.0, perKm: 0.5 },
  [VEHICLE_CAR4]: { base: 2.5, perKm: 1.0 },
  [VEHICLE_CAR7]: { base: 4.0, perKm: 1.5 },
};

export const CANCELLATION_FEE_CONFIG = {
  [VEHICLE_BIKE]: 0.5,
  [VEHICLE_CAR4]: 1.0,
  [VEHICLE_CAR7]: 1.0,
};
