import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getCoords } from '../services';
import { isCoordsInServiceArea } from '../utils/validation';
import {
  API_ENDPOINTS,
  PRICING_CONFIG,
  VEHICLE_BIKE,
  VEHICLE_CAR4,
  VEHICLE_CAR7,
  ACTIVE_CITY,
  BUSINESS_RULES,
} from '../constants';

export const estimateRideTool = tool(
  async ({ pickup, destination }) => {
    const apiKey = process.env.ORS_API_KEY || '';
    let distance = 0;
    let duration = 0;
    let fallbackUsed = false;

    const startCoords = await getCoords(pickup, apiKey);
    const endCoords = await getCoords(destination, apiKey);

    // Validate if coordinates exist and are within service area boundary
    if (startCoords && !isCoordsInServiceArea(startCoords[1], startCoords[0])) {
      return { error: 'outside_service_area', location: pickup } as any;
    }

    if (endCoords && !isCoordsInServiceArea(endCoords[1], endCoords[0])) {
      return { error: 'outside_service_area', location: destination } as any;
    }

    if (startCoords && endCoords) {
      try {
        const directionsUrl = `${API_ENDPOINTS.ORS_DIRECTIONS_URL}?api_key=${apiKey}&start=${startCoords.join(',')}&end=${endCoords.join(',')}`;
        const response = await fetch(directionsUrl);
        if (response.ok) {
          const dirData = (await response.json()) as any;
          if (dirData.features && dirData.features.length > 0) {
            const summary = dirData.features[0].properties.summary;
            distance = parseFloat((summary.distance / 1000).toFixed(1)); // Convert meters to km
            duration = Math.round(summary.duration / 60); // Convert seconds to minutes
          } else {
            fallbackUsed = true;
          }
        } else {
          console.error(
            `Directions API returned error status: ${response.status}`,
          );
          fallbackUsed = true;
        }
      } catch (error) {
        console.error('Error fetching directions from ORS:', error);
        fallbackUsed = true;
      }
    } else {
      fallbackUsed = true;
    }

    if (fallbackUsed) {
      // If geocoding failed for either location, ask user to clarify instead of guessing
      if (!startCoords && !endCoords) {
        return {
          error: 'ambiguous_location',
          message: `Could not find either location: "${pickup}" and "${destination}". Please provide more specific addresses or landmarks.`,
        } as any;
      }
      if (!startCoords) {
        return {
          error: 'ambiguous_location',
          message: `Could not find pickup location: "${pickup}". Please provide a more specific address or landmark.`,
        } as any;
      }
      if (!endCoords) {
        return {
          error: 'ambiguous_location',
          message: `Could not find destination: "${destination}". Please provide a more specific address or landmark.`,
        } as any;
      }
      // Geocoding succeeded but directions API failed — estimate from coords
      const R = 6371; // Earth radius in km
      const dLat = ((endCoords[1] - startCoords[1]) * Math.PI) / 180;
      const dLon = ((endCoords[0] - startCoords[0]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startCoords[1] * Math.PI) / 180) *
          Math.cos((endCoords[1] * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = parseFloat((R * c * 1.3).toFixed(1)); // 1.3x for road distance estimate
      duration = Math.round(distance * 1.5 + 5);
    }

    // Validate distance boundary (max distance)
    if (distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM) {
      return { error: 'distance_limit_exceeded', distance } as any;
    }

    // Calculate rates (USD) using config:
    const bikePrice = parseFloat(
      (
        PRICING_CONFIG[VEHICLE_BIKE].base +
        distance * PRICING_CONFIG[VEHICLE_BIKE].perKm
      ).toFixed(2),
    );
    const car4Price = parseFloat(
      (
        PRICING_CONFIG[VEHICLE_CAR4].base +
        distance * PRICING_CONFIG[VEHICLE_CAR4].perKm
      ).toFixed(2),
    );
    const car7Price = parseFloat(
      (
        PRICING_CONFIG[VEHICLE_CAR7].base +
        distance * PRICING_CONFIG[VEHICLE_CAR7].perKm
      ).toFixed(2),
    );

    return {
      pickup,
      destination,
      distance,
      duration,
      pickupLat: startCoords ? startCoords[1] : undefined,
      pickupLng: startCoords ? startCoords[0] : undefined,
      destLat: endCoords ? endCoords[1] : undefined,
      destLng: endCoords ? endCoords[0] : undefined,
      options: [
        { vehicleType: VEHICLE_BIKE, price: bikePrice },
        { vehicleType: VEHICLE_CAR4, price: car4Price },
        { vehicleType: VEHICLE_CAR7, price: car7Price },
      ],
    };
  },
  {
    name: 'estimateRide',
    description:
      'Calculate ride distance, duration, and price estimates between pickup and destination.',
    schema: z.object({
      pickup: z.string().describe(`Pickup location name (must be in ${ACTIVE_CITY.englishName})`),
      destination: z
        .string()
        .describe(`Destination location name (must be in ${ACTIVE_CITY.englishName})`),
    }),
  },
);

