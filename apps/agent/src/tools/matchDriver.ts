import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

import { updateTripInDb } from '@/db/operations';
import { db } from '@/db';
import { drivers } from '@/db/schema';
import { VEHICLE_TYPES, BUSINESS_RULES } from '@/constants';
import { haversineDistance } from '@/utils';

export const matchDriverTool = tool(
  async ({ tripId, vehicleType, pickupLat, pickupLng }) => {
    // Query all available drivers of the matching vehicle type
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.isAvailable, true),
          eq(drivers.vehicleType, vehicleType),
        ),
      );

    if (availableDrivers.length === 0) {
      return {
        success: false,
        tripId,
        error: 'no_available_drivers',
        message: `No available ${vehicleType} drivers found at the moment.`,
      };
    }

    // Sort drivers by proximity to pickup location (nearest first)
    const driversWithDistance = availableDrivers.map((d) => ({
      ...d,
      distanceFromPickup: haversineDistance(
        pickupLat,
        pickupLng,
        d.latitude,
        d.longitude,
      ),
    }));
    driversWithDistance.sort(
      (a, b) => a.distanceFromPickup - b.distanceFromPickup,
    );

    const matchedDriver = driversWithDistance[0];

    // Mark the selected driver as unavailable (busy)
    await db
      .update(drivers)
      .set({ isAvailable: false })
      .where(eq(drivers.id, matchedDriver.id));

    const driverInfo = {
      name: matchedDriver.name,
      phone: matchedDriver.phone,
      vehicleInfo: matchedDriver.vehicleInfo,
      licensePlate: matchedDriver.licensePlate,
      rating: matchedDriver.rating || 5.0,
    };

    // Update the trip status to 'matched' and assign the driver in the DB
    await updateTripInDb(tripId, {
      status: 'matched',
      driver: driverInfo,
    });

    // 5. Calculate ETA based on driver's distance from pickup (avg speed in city)
    const etaMinutes = Math.max(
      1,
      Math.round(
        (matchedDriver.distanceFromPickup / BUSINESS_RULES.AVERAGE_SPEED_KMH) *
          60,
      ),
    );

    return {
      success: true,
      tripId,
      status: 'matched' as const,
      driver: driverInfo,
      etaMinutes,
    };
  },
  {
    name: 'matchDriver',
    description:
      'Start driver matching for an approved trip request. Finds the nearest available driver.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to match a driver for'),
      vehicleType: z
        .enum(VEHICLE_TYPES)
        .describe('The vehicle type of the request'),
      pickupLat: z.number().describe('Latitude of the pickup location'),
      pickupLng: z.number().describe('Longitude of the pickup location'),
    }),
  },
);
