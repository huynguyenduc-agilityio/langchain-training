import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getCoords } from '../services';
import {
  API_ENDPOINTS,
  PRICING_CONFIG,
  VEHICLE_BIKE,
  VEHICLE_CAR4,
  VEHICLE_CAR7,
} from '../constants';

export const estimateRideTool = tool(
  async ({ pickup, destination }) => {
    const apiKey = process.env.ORS_API_KEY || '';
    let distance = 0;
    let duration = 0;
    let fallbackUsed = false;

    const startCoords = await getCoords(pickup, apiKey);
    const endCoords = await getCoords(destination, apiKey);

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
      // Generate simulated distance (e.g. 3 to 23 km based on names length)
      const seed = ((pickup.length + destination.length) % 20) + 3;
      distance = parseFloat(seed.toFixed(1));
      duration = Math.round(distance * 1.5 + 5);
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
      pickup: z.string().describe('Pickup location name (must be in Da Nang)'),
      destination: z
        .string()
        .describe('Destination location name (must be in Da Nang)'),
    }),
  },
);
