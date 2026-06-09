import { RideBookingState } from '../state/state';
import {
  isWithinOperatingHours,
  hasTooManyActiveTrips,
  isValidPhone,
} from '../utils/validation';
import { VALIDATION_MESSAGES, BUSINESS_RULES } from '../constants';

export async function inputValidationNode(state: RideBookingState) {
  // 1. Check operating hours (05:00 - 23:00)
  if (!isWithinOperatingHours()) {
    return {
      validationError: VALIDATION_MESSAGES.OPERATING_HOURS_ERROR,
    };
  }

  // 2. Check active trips limit (max 3)
  if (hasTooManyActiveTrips(state.userTrips)) {
    return {
      validationError: VALIDATION_MESSAGES.ACTIVE_TRIPS_LIMIT_ERROR,
    };
  }

  // 3. Validate distance limits (max 50 km)
  if (state.tripDraft?.distance && state.tripDraft.distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM) {
    return {
      validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
    };
  }

  if (state.rideEstimate?.distance && state.rideEstimate.distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM) {
    return {
      validationError: VALIDATION_MESSAGES.DISTANCE_LIMIT_ERROR,
    };
  }

  // 4. Validate phone format if present in trip draft
  if (state.tripDraft?.passengerPhone && !isValidPhone(state.tripDraft.passengerPhone)) {
    return {
      validationError: VALIDATION_MESSAGES.PHONE_FORMAT_ERROR,
    };
  }

  return {
    validationError: null,
  };
}


