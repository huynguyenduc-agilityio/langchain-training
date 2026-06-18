import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getCoords } from '@/services';
import {
  isCoordsInServiceArea,
  haversineDistance,
  metersToKm,
  secondsToMinutes,
} from '@/utils';
import { EstimateRideResult, ORSDirectionsResponse } from '@/types';
import {
  API_ENDPOINTS,
  PRICING_CONFIG,
  VEHICLE_BIKE,
  VEHICLE_CAR4,
  VEHICLE_CAR7,
  ACTIVE_CITY,
  BUSINESS_RULES,
  ERROR_CODES,
  ERROR_MESSAGES,
  AGENT_TOOLS,
} from '@/constants';

export const estimateRideTool = tool(
  async ({ pickup, destination }): Promise<EstimateRideResult> => {
    const apiKey = process.env.ORS_API_KEY || '';
    let distance = 0;
    let duration = 0;
    let fallbackUsed = false;

    const startCoords = await getCoords(pickup, apiKey);
    const endCoords = await getCoords(destination, apiKey);

    // Validate if coordinates exist and are within service area boundary
    if (startCoords && !isCoordsInServiceArea(startCoords[1], startCoords[0])) {
      return { error: ERROR_CODES.OUTSIDE_SERVICE_AREA, location: pickup };
    }

    if (endCoords && !isCoordsInServiceArea(endCoords[1], endCoords[0])) {
      return { error: ERROR_CODES.OUTSIDE_SERVICE_AREA, location: destination };
    }

    if (startCoords && endCoords) {
      try {
        const directionsUrl = `${API_ENDPOINTS.ORS_DIRECTIONS_URL}?api_key=${apiKey}&start=${startCoords.join(',')}&end=${endCoords.join(',')}`;
        const response = await fetch(directionsUrl);
        if (response.ok) {
          const dirData = (await response.json()) as ORSDirectionsResponse;
          if (dirData.features && dirData.features.length > 0) {
            const summary = dirData.features[0].properties?.summary;
            if (summary) {
              distance = metersToKm(summary.distance);
              duration = secondsToMinutes(summary.duration);
            } else {
              fallbackUsed = true;
            }
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
          error: ERROR_CODES.AMBIGUOUS_LOCATION,
          message: ERROR_MESSAGES.AMBIGUOUS_BOTH(pickup, destination),
        };
      }
      if (!startCoords) {
        return {
          error: ERROR_CODES.AMBIGUOUS_LOCATION,
          message: ERROR_MESSAGES.AMBIGUOUS_PICKUP(pickup),
        };
      }
      if (!endCoords) {
        return {
          error: ERROR_CODES.AMBIGUOUS_LOCATION,
          message: ERROR_MESSAGES.AMBIGUOUS_DESTINATION(destination),
        };
      }
      // Geocoding succeeded but directions API failed — estimate from coords
      const hDist = haversineDistance(
        startCoords[1],
        startCoords[0],
        endCoords[1],
        endCoords[0],
      );
      distance = parseFloat(
        (hDist * BUSINESS_RULES.FALLBACK_ESTIMATE.DISTANCE_MULTIPLIER).toFixed(
          1,
        ),
      ); // multiplier for road distance estimate
      duration = Math.round(
        distance * BUSINESS_RULES.FALLBACK_ESTIMATE.DURATION_MULTIPLIER +
          BUSINESS_RULES.FALLBACK_ESTIMATE.DURATION_OFFSET,
      );
    }

    // Validate distance boundary (max distance)
    if (distance > BUSINESS_RULES.MAX_RIDE_DISTANCE_KM) {
      return { error: ERROR_CODES.DISTANCE_LIMIT_EXCEEDED, distance };
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
    name: AGENT_TOOLS.ESTIMATE_RIDE.name,
    description: AGENT_TOOLS.ESTIMATE_RIDE.description,
    schema: z.object({
      pickup: z
        .string()
        .describe(
          `Pickup location name (must be in ${ACTIVE_CITY.englishName})`,
        ),
      destination: z
        .string()
        .describe(
          `Destination location name (must be in ${ACTIVE_CITY.englishName})`,
        ),
    }),
  },
);
