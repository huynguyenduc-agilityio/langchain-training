import { REGEX } from '@/constants';

/**
 * Sanitizes phone number string by removing whitespace, dashes, and parentheses.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(REGEX.PHONE_CLEAN, '');
}

/**
 * Validates phone number format (standard international/local format).
 */
export function isValidPhone(phone: string): boolean {
  return REGEX.PHONE.test(sanitizePhone(phone));
}
