import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { updateTripInDb } from '@/db/operations';
import { CANCELLATION_FEE_CONFIG, VEHICLE_TYPES, AGENT_TOOLS } from '@/constants';

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
    name: AGENT_TOOLS.CANCEL_TRIP.name,
    description: AGENT_TOOLS.CANCEL_TRIP.description,
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
