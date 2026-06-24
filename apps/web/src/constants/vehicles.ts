import type { VehicleType } from '@repo/shared';

export const VEHICLE_CONFIG = {
  bike: { label: 'Bike', icon: '🏍️' },
  car4: { label: 'Car (4-seat)', icon: '🚗' },
  car7: { label: 'Car (7-seat)', icon: '🚙' },
} as const;

export const VEHICLE_NAMES: Record<VehicleType, string> = {
  bike: 'Bike',
  car4: 'Car (4-seat)',
  car7: 'Car (7-seat)',
};

export const VEHICLE_EMOJIS: Record<VehicleType, string> = {
  bike: '🏍️',
  car4: '🚗',
  car7: '🚙',
};
