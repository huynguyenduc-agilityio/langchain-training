import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { updateTripInDb } from '@/db/operations';
import { CANCELLATION_FEE_CONFIG, VEHICLE_TYPES } from '@/constants';

export const cancelTripTool = tool(
  async ({ tripId, driverMatched, vehicleType }) => {
    let cancellationFee = 0;
    if (driverMatched) {
      cancellationFee = CANCELLATION_FEE_CONFIG[vehicleType];
    }

    // Update in-memory DB status
    await updateTripInDb(tripId, {
      status: 'cancelled',
      cancellationFee,
      cancelledAt: new Date().toISOString(),
    });

    return {
      success: true,
      tripId,
      status: 'cancelled' as const,
      cancellationFee,
      cancelledAt: new Date().toISOString(),
    };
  },
  {
    name: 'cancelTrip',
    description:
      'Cancel a trip and calculate the cancellation fee if applicable.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
      driverMatched: z
        .boolean()
        .describe('Whether a driver is already matched to this trip'),
      vehicleType: z
        .enum(VEHICLE_TYPES)
        .describe('The vehicle type of the trip'),
    }),
  },
);
