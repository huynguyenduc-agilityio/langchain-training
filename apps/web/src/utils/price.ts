import { PRICING_CONFIG } from '@repo/shared';
import type { VehicleType } from '@repo/shared';

export function calculatePrice(
  distance: number,
  vehicleType: VehicleType,
): number {
  const config = PRICING_CONFIG[vehicleType] || PRICING_CONFIG.bike;
  return Number.parseFloat((config.base + distance * config.perKm).toFixed(2));
}

export function formatPrice(amount: number | undefined | null): string {
  if (amount == null || Number.isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
}
