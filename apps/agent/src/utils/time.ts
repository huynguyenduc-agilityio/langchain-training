import { ACTIVE_CITY, BUSINESS_RULES } from '@/constants';

/**
 * Checks if the current request is within operating hours for the active city.
 */
export function isWithinOperatingHours(): boolean {
  // Get current hour in the active city's timezone (using offset)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + 3600000 * ACTIVE_CITY.timezoneOffset);
  const hour = cityTime.getHours();

  return (
    hour >= BUSINESS_RULES.OPERATING_HOURS.START &&
    hour < BUSINESS_RULES.OPERATING_HOURS.END
  );
}

/**
 * Convert seconds to minutes, rounded to the nearest integer.
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}
