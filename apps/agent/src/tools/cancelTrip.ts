import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getTripFromDb } from '@/db/operations';
import { CANCELLATION_FEE_CONFIG, AGENT_TOOLS } from '@/constants';
import { logError } from '@repo/logger';

export const cancelTripTool = tool(
  async ({ tripId }) => {
    try {
      const trip = await getTripFromDb(tripId);
      if (!trip) {
        return {
          success: false,
          error: 'trip_not_found',
          reason: `Trip ${tripId} not found. Please check the trip ID and try again.`,
        };
      }

      if (trip.status === 'cancelled') {
        return {
          success: false,
          error: 'already_cancelled',
          reason: `This trip has already been cancelled.`,
        };
      }

      if (trip.status === 'completed') {
        return {
          success: false,
          error: 'already_completed',
          reason: `This trip is already completed and cannot be cancelled.`,
        };
      }

      const driverMatched = !!trip.driver;
      const cancellationFee = driverMatched
        ? (CANCELLATION_FEE_CONFIG[trip.vehicleType] ?? 1.0)
        : 0;

      return {
        success: true,
        needs_confirm: true,
        tripId,
        pickup: trip.pickup,
        destination: trip.destination,
        cancellationFee,
        driverName: trip.driver?.name || null,
      };
    } catch (error) {
      logError(error, `[CancelTripTool] Error checking trip ${tripId}:`);
      return {
        success: false,
        error: 'cancellation_failed',
        reason:
          'An internal error occurred while processing your cancellation request.',
      };
    }
  },
  {
    name: AGENT_TOOLS.CANCEL_TRIP.name,
    description: AGENT_TOOLS.CANCEL_TRIP.description,
    schema: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
    }),
  },
);
