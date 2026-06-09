import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { updateTripInDb } from '../utils';

export const cancelTripTool = tool(
  async ({ tripId, driverMatched, vehicleType }) => {
    let cancellationFee = 0;
    if (driverMatched) {
      cancellationFee = vehicleType === 'bike' ? 0.5 : 1.0;
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
    description: 'Cancel a trip and calculate the cancellation fee if applicable.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
      driverMatched: z.boolean().describe('Whether a driver is already matched to this trip'),
      vehicleType: z.enum(['bike', 'car4', 'car7']).describe('The vehicle type of the trip'),
    }),
  }
);
