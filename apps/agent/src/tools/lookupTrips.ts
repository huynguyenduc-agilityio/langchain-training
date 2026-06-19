import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getTripsByPhoneFromDb, getTripsByUserIdFromDb } from '@/db/operations';
import { Trip } from '@/types';
import { AGENT_TOOLS, BUSINESS_RULES } from '@/constants';

export const lookupTripsTool = tool(
  async ({ passengerPhone, userId }, config) => {
    const finalUserId =
      userId ||
      config?.configurable?.copilotkit_properties?.userId ||
      config?.configurable?.userId;

    let trips: Trip[] = [];
    if (finalUserId) {
      trips = await getTripsByUserIdFromDb(
        finalUserId,
        BUSINESS_RULES.TRIPS_DISPLAY_LIMIT,
      );
    } else if (passengerPhone) {
      trips = await getTripsByPhoneFromDb(
        passengerPhone,
        BUSINESS_RULES.TRIPS_DISPLAY_LIMIT,
      );
    }

    return {
      success: true,
      passengerPhone: passengerPhone || 'N/A',
      trips,
      limit: BUSINESS_RULES.TRIPS_DISPLAY_LIMIT,
      message: finalUserId
        ? `Retrieved ${trips.length} most recent trips (limit: ${BUSINESS_RULES.TRIPS_DISPLAY_LIMIT}) for the current authenticated user.`
        : `Retrieved ${trips.length} most recent trips (limit: ${BUSINESS_RULES.TRIPS_DISPLAY_LIMIT}) for phone number ${passengerPhone}.`,
    };
  },
  {
    name: AGENT_TOOLS.LOOKUP_TRIPS.name,
    description: AGENT_TOOLS.LOOKUP_TRIPS.description,
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
