import { Trip } from '../types';
import { ACTIVE_CITY, BUSINESS_RULES } from '../constants';

/**
 * Validates phone number format (standard international/local format).
 */
export function isValidPhone(phone: string): boolean {
  // Simple regex matching international format (e.g., +84... or +1...) or local VN format
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Validates if the request is within operating hours.
 */
export function isWithinOperatingHours(): boolean {
  // Get current hour in the active city's timezone (using offset)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + 3600000 * ACTIVE_CITY.timezoneOffset);
  const hour = cityTime.getHours();

  return hour >= BUSINESS_RULES.OPERATING_HOURS.START && hour < BUSINESS_RULES.OPERATING_HOURS.END;
}

/**
 * Validates active trips limit.
 */
export function hasTooManyActiveTrips(trips: Trip[]): boolean {
  const activeStatuses = ['searching', 'matched', 'picked_up'];
  const activeCount = trips.filter((t) =>
    activeStatuses.includes(t.status),
  ).length;
  return activeCount >= BUSINESS_RULES.MAX_ACTIVE_TRIPS;
}

/**
 * Validates if coordinates are inside the active city service boundaries (bounding box).
 */
export function isCoordsInServiceArea(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = ACTIVE_CITY.bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}


