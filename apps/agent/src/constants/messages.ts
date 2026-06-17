import { ACTIVE_CITY } from './locations';
import { BUSINESS_RULES } from './rules';

const startHourStr =
  String(BUSINESS_RULES.OPERATING_HOURS.START).padStart(2, '0') + ':00';
const endHourStr =
  String(BUSINESS_RULES.OPERATING_HOURS.END).padStart(2, '0') + ':00';

export const VALIDATION_MESSAGES = {
  OPERATING_HOURS_ERROR: `Booking services are only available between ${startHourStr} and ${endHourStr}. Please request a ride during operating hours.`,
  ACTIVE_TRIPS_LIMIT_ERROR: `You have reached the maximum limit of ${BUSINESS_RULES.MAX_ACTIVE_TRIPS} active trips. Please cancel or complete an active trip before booking another.`,
  OUTSIDE_SERVICE_AREA_ERROR: `CityRide services are strictly confined to the ${ACTIVE_CITY.name} city boundary. Your requested location is outside our service area.`,
  PHONE_FORMAT_ERROR:
    'Please provide a valid phone number (9-15 digits, international or local format, e.g., +84...) to proceed with the booking.',
  DISTANCE_LIMIT_ERROR: `The requested trip distance exceeds our maximum limit of ${BUSINESS_RULES.MAX_RIDE_DISTANCE_KM} km. Please choose a closer destination.`,
};

export const ERROR_MESSAGES = {
  AMBIGUOUS_BOTH: (pickup: string, destination: string) =>
    `Could not find either location: "${pickup}" and "${destination}". Please provide more specific addresses or landmarks.`,
  AMBIGUOUS_PICKUP: (pickup: string) =>
    `Could not find pickup location: "${pickup}". Please provide a more specific address or landmark.`,
  AMBIGUOUS_DESTINATION: (destination: string) =>
    `Could not find destination: "${destination}". Please provide a more specific address or landmark.`,
};
