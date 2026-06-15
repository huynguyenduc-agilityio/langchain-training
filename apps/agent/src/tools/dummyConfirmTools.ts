import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const dummyRideConfirmTool = tool(
  async () => ({ success: true }),
  {
    name: 'showRideConfirm',
    description: 'Display the final ride request details for user approval.',
    schema: z.object({
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      distance: z.number().describe('The ride distance in km'),
      duration: z.number().describe('The travel duration in minutes'),
      vehicleType: z.enum(['bike', 'car4', 'car7']).describe('The selected vehicle type'),
      passengerName: z.string().describe('The passenger name'),
      passengerPhone: z.string().describe('The passenger phone number'),
      price: z.number().describe('The total ride price'),
    }),
  }
);

export const dummyCancelConfirmTool = tool(
  async () => ({ success: true }),
  {
    name: 'showCancelConfirm',
    description: 'Display the cancellation confirmation details for a trip.',
    schema: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
    }),
  }
);
