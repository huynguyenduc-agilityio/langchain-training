import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getTripsByPhoneFromDb, getTripsByUserIdFromDb } from '@/db/operations';
import { Trip } from '@/types';

export const lookupTripsTool = tool(
  async ({ passengerPhone, userId }, config) => {
    const finalUserId =
      userId ||
      config?.configurable?.copilotkit_properties?.userId ||
      config?.configurable?.userId;

    let trips: Trip[] = [];
    if (finalUserId) {
      trips = await getTripsByUserIdFromDb(finalUserId);
    } else if (passengerPhone) {
      trips = await getTripsByPhoneFromDb(passengerPhone);
    }

    return {
      success: true,
      passengerPhone: passengerPhone || 'N/A',
      trips,
      message: finalUserId
        ? `Retrieved ${trips.length} trips for the current authenticated user.`
        : `Retrieved ${trips.length} trips for phone number ${passengerPhone}.`,
    };
  },
  {
    name: 'lookupTrips',
    description:
      "Lookup the current authenticated user's trips, or search by passenger phone number.",
    schema: z.object({
      passengerPhone: z
        .string()
        .optional()
        .describe("Optional passenger's phone number to lookup"),
      userId: z
        .string()
        .optional()
        .describe(
          'The ID of the currently authenticated user (retrieved from the user profile context)',
        ),
    }),
  },
);
