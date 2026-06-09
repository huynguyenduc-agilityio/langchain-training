import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getTripsByPhoneFromDb } from '../db/operations';

export const lookupTripsTool = tool(
  async ({ passengerPhone }) => {
    const trips = await getTripsByPhoneFromDb(passengerPhone);
    return {
      success: true,
      passengerPhone,
      trips,
      message: `Retrieved ${trips.length} trips for phone number ${passengerPhone}.`,
    };
  },
  {
    name: 'lookupTrips',
    description: 'Lookup a user\'s trips using their phone number.',
    schema: z.object({
      passengerPhone: z.string().describe('The passenger\'s phone number to lookup'),
    }),
  }
);
