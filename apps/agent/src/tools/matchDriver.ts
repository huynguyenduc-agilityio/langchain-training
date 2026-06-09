import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { updateTripInDb, MOCK_DRIVERS } from '../utils';

export const matchDriverTool = tool(
  async ({ tripId, vehicleType }) => {
    // Find driver matching vehicle type or default
    const driver = MOCK_DRIVERS.find((d) => {
      if (vehicleType === 'bike') return d.vehicleInfo.toLowerCase().includes('vision');
      if (vehicleType === 'car4') return d.vehicleInfo.toLowerCase().includes('vios');
      if (vehicleType === 'car7') return d.vehicleInfo.toLowerCase().includes('xpander');
      return true;
    }) || MOCK_DRIVERS[0];

    // Update the database
    await updateTripInDb(tripId, { status: 'matched', driver });

    return {
      success: true,
      tripId,
      status: 'matched' as const,
      driver,
      etaMinutes: 3,
    };
  },
  {
    name: 'matchDriver',
    description: 'Start simulated driver matching for an approved trip request.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to match a driver for'),
      vehicleType: z.enum(['bike', 'car4', 'car7']).describe('The vehicle type of the request'),
    }),
  }
);
