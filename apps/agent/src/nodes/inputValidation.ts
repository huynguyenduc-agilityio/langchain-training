import { RideBookingState } from '../state/state';
import {
  isWithinOperatingHours,
  hasTooManyActiveTrips,
  isValidPhone,
} from '../utils/validation';
import { VALIDATION_MESSAGES, BUSINESS_RULES } from '../constants';

export async function inputValidationNode(state: RideBookingState) {
  // Determine if this is a booking-related flow.
  // We check intent (if already classified) and the presence of a tripDraft/rideEstimate.
  const intentCategory = state.intent?.category;
  const isBookingIntent =
    intentCategory === 'estimate' ||
    intentCategory === 'request' ||
    !!state.tripDraft ||
    !!state.rideEstimate;

  // 1. Check operating hours (05:00 - 23:00) — only for booking flows
  if (isBookingIntent && !isWithinOperatingHours()) {
    return {
      validationError: VALIDATION_MESSAGES.OPERATING_HOURS_ERROR,
    };
  }

  // 2. Check active trips limit (max 3) — only for booking flows
  if (isBookingIntent && hasTooManyActiveTrips(state.userTrips)) {
    return {
      validationError: VALIDATION_MESSAGES.ACTIVE_TRIPS_LIMIT_ERROR,
    };
  }

  // 3. Validate distance limits (max 50 km) — only when estimate/draft exists
  if (
    state.tripDraft?.distance &&
    state.tripDraft.distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM
  ) {
    return {
      validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
    };
  }

  if (
    state.rideEstimate?.distance &&
    state.rideEstimate.distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM
  ) {
    return {
      validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
    };
  }

  // 4. Validate phone format if present in trip draft (booking flow only)
  if (
    state.tripDraft?.passengerPhone &&
    !isValidPhone(state.tripDraft.passengerPhone)
  ) {
    return {
      validationError: VALIDATION_MESSAGES.PHONE_FORMAT_ERROR,
    };
  }

  return {
    validationError: null,
  };
}
