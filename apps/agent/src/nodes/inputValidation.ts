import { RideBookingState } from '../state/state';
import { isWithinOperatingHours, hasTooManyActiveTrips } from '../utils/validation';

export async function inputValidationNode(state: RideBookingState) {
  console.log('\n=== INPUT VALIDATION NODE ===');

  // 1. Check operating hours (05:00 - 23:00)
  if (!isWithinOperatingHours()) {
    return {
      validationError: 'Booking services are only available between 05:00 and 23:00. Please request a ride during operating hours.',
    };
  }

  // 2. Check active trips limit (max 3)
  if (hasTooManyActiveTrips(state.userTrips)) {
    return {
      validationError: 'You have reached the maximum limit of 3 active trips. Please cancel or complete an active trip before booking another.',
    };
  }

  // 3. Check for external city mentions in the last human message
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage._getType() === 'human') {
    const text = (lastMessage.content as string).toLowerCase();
    const outsideKeywords = ['hanoi', 'ha noi', 'saigon', 'ho chi minh', 'hue', 'nha trang', 'da lat', 'dalat'];
    if (outsideKeywords.some((city) => text.includes(city))) {
      return {
        validationError: 'CityRide services are strictly confined to the Đà Nẵng city boundary. Your requested location is outside our service area.',
      };
    }
  }

  return {
    validationError: null,
  };
}
