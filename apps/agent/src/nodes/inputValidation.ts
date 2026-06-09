import { RideBookingState } from '../state/state';
import { isWithinOperatingHours, hasTooManyActiveTrips } from '../utils/validation';
import { OUTSIDE_DA_NANG, VALIDATION_MESSAGES } from '../constants';

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

  // 3. Check for external city mentions in the last human message
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage._getType() === 'human') {
    const text = (lastMessage.content as string).toLowerCase();
    if (OUTSIDE_DA_NANG.some((city) => text.includes(city))) {
      return {
        validationError: VALIDATION_MESSAGES.OUTSIDE_SERVICE_AREA_ERROR,
      };
    }
  }

  return {
    validationError: null,
  };
}
