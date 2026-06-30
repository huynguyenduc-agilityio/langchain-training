import { Trip } from '@repo/shared';
import { ACTIVE_CITY, BUSINESS_RULES } from '@/constants';

/**
 * Checks if the number of active trips exceeds the allowed limit.
 */
export function hasTooManyActiveTrips(trips: Trip[]): boolean {
  const activeStatuses = ['searching', 'matched', 'picked_up'];
  const activeCount = trips.filter((t) =>
    activeStatuses.includes(t.status),
  ).length;
  return activeCount >= BUSINESS_RULES.MAX_ACTIVE_TRIPS;
}

/**
 * Checks if coordinates are inside the active city service boundaries (bounding box).
 */
export function isCoordsInServiceArea(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = ACTIVE_CITY.bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
