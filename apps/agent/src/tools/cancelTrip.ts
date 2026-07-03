import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getTripFromDb, getTripsByUserIdFromDb } from '@/db/operations';
import { AGENT_TOOLS } from '@/constants';
import { logError } from '@repo/logger';

export const cancelTripTool = tool(
  async ({ tripId, userId: argsUserId }, config) => {
    try {
      const userId =
        argsUserId ||
        config?.configurable?.copilotkit_properties?.userId ||
        config?.configurable?.userId;

      // Case 1: No tripId provided, return active trips list for user selection
      if (!tripId) {
        if (!userId) {
          return {
            success: false,
            error: 'user_not_authenticated',
            reason: 'You must be logged in to cancel a trip.',
          };
        }

        // Fetch user's trips and filter for cancellable ones
        const allTrips = await getTripsByUserIdFromDb(userId, 20);
        const activeTrips = allTrips.filter(
          (t) =>
            t.status === 'searching' ||
            t.status === 'matched' ||
            t.status === 'picked_up',
        );

        if (activeTrips.length === 0) {
          return {
            success: false,
            error: 'no_active_trips',
            reason: 'You do not have any active trips that can be cancelled.',
          };
        }

        if (activeTrips.length === 1) {
          const trip = activeTrips[0];
          return {
            success: true,
            needs_confirm: true,
            is_selection: false,
            tripId: trip.id,
            pickup: trip.pickup,
            destination: trip.destination,
            driverName: trip.driver?.name || null,
          };
        }

        return {
          success: true,
          needs_confirm: true,
          is_selection: true,
          trips: activeTrips,
        };
      }

      // Case 2: tripId is provided
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

      return {
        success: true,
        needs_confirm: true,
        is_selection: false,
        tripId,
        pickup: trip.pickup,
        destination: trip.destination,
        driverName: trip.driver?.name || null,
      };
    } catch (error) {
      logError(error, `[CancelTripTool] Error processing cancellation:`);
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
      tripId: z
        .string()
        .optional()
        .describe(
          'The trip ID to cancel. If omitted, active trips list will be shown.',
        ),
      userId: z
        .string()
        .optional()
        .describe(
          'The authenticated user ID from PROFILE. Must be provided when no tripId is given.',
        ),
    }),
  },
);
