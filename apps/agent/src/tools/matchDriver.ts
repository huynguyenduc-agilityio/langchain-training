import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { updateTripInDb } from '../db/operations';
import { db } from '../db';
import { drivers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const matchDriverTool = tool(
  async ({ tripId, vehicleType }) => {
    // Simulate driver shortage/matching failure (e.g. if ID ends in '9' or 10% of the time)
    const isFailure = tripId.endsWith('9') || Math.random() < 0.1;
    if (isFailure) {
      return {
        success: false,
        tripId,
        error: 'no_available_drivers',
        message:
          'No driver available nearby matching your vehicle type. Please retry or cancel.',
      };
    }

    // 1. Query an available driver of the matching vehicle type from the database
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.isAvailable, true),
          eq(drivers.vehicleType, vehicleType),
        ),
      )
      .limit(1);

    if (availableDrivers.length === 0) {
      return {
        success: false,
        tripId,
        error: 'no_available_drivers',
        message: `No available ${vehicleType} drivers found at the moment.`,
      };
    }

    const matchedDriver = availableDrivers[0];

    // 2. Mark the selected driver as unavailable (busy)
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

    // 3. Update the trip status to 'matched' and assign the driver in the DB
    await updateTripInDb(tripId, {
      status: 'matched',
      driver: driverInfo,
    });

    return {
      success: true,
      tripId,
      status: 'matched' as const,
      driver: driverInfo,
      etaMinutes: 3,
    };
  },
  {
    name: 'matchDriver',
    description:
      'Start simulated driver matching for an approved trip request.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to match a driver for'),
      vehicleType: z
        .enum(['bike', 'car4', 'car7'])
        .describe('The vehicle type of the request'),
    }),
  },
);
