import { Trip } from '../state';

// Popular Da Nang landmarks and keywords
const DA_NANG_LANDMARKS = [
  'dragon bridge',
  'da nang',
  'airport',
  'marble mountain',
  'linh ung',
  'han river',
  'son tra',
  'thuan phuoc',
  'my khe',
  'han market',
  'cham museum',
  'asia park',
];

const OUTSIDE_DA_NANG = [
  'ha noi',
  'hanoi',
  'ho chi minh',
  'saigon',
  'hue',
  'nha trang',
  'da lat',
  'dalat',
];

/**
 * Validates if a location name is within the Da Nang service area boundary.
 */
export function isWithinDaNang(location: string): boolean {
  const loc = location.toLowerCase();

  // If explicitly outside Da Nang
  if (OUTSIDE_DA_NANG.some((outside) => loc.includes(outside))) {
    return false;
  }

  // If contains Da Nang or a known landmark
  if (DA_NANG_LANDMARKS.some((landmark) => loc.includes(landmark))) {
    return true;
  }

  // By default, since it's a Da Nang local taxi service, we can allow unless they name a city outside
  return true;
}

/**
 * Validates phone number format (standard international/local format).
 */
export function isValidPhone(phone: string): boolean {
  // Simple regex matching international format (e.g., +84... or +1...) or local VN format
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Validates if the request is within operating hours (05:00 to 23:00).
 */
export function isWithinOperatingHours(): boolean {
  // Get current hour in Da Nang (ICT, UTC+7)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const daNangTime = new Date(utc + 3600000 * 7); // Da Nang is UTC+7
  const hour = daNangTime.getHours();

  return hour >= 5 && hour < 23;
}

/**
 * Validates active trips limit (max 3 active trips).
 */
export function hasTooManyActiveTrips(trips: Trip[]): boolean {
  const activeStatuses = ['searching', 'matched', 'picked_up'];
  const activeCount = trips.filter((t) =>
    activeStatuses.includes(t.status),
  ).length;
  return activeCount >= 3;
}
