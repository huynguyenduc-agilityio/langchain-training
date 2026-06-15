import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const requestRideTool = tool(
  async (args) => {
    try {
      const result = {
        success: true,
        tripDraft: {
          pickup: args.pickup,
          destination: args.destination,
          distance: args.distance,
          duration: args.duration,
          vehicleType: args.vehicleType,
          passengerName: args.passengerName,
          passengerPhone: args.passengerPhone,
          price: args.price,
          status: 'searching',
        },
      };

      return result;
    } catch (e: any) {
      console.error('[requestRideTool] Error:', e);
      throw e;
    }
  },
  {
    name: 'requestRide',
    description:
      'Initiate a draft ride booking request once passenger details and vehicle selection are provided.',
    schema: z.object({
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      distance: z.number().describe('The ride distance in km'),
      duration: z.number().describe('The travel duration in minutes'),
      vehicleType: z
        .enum(['bike', 'car4', 'car7'])
        .describe('The selected vehicle type'),
      passengerName: z.string().describe('The passenger name'),
      passengerPhone: z
        .string()
        .describe('The passenger phone number (e.g. +84...)'),
      price: z.number().describe('The agreed price for the ride'),
    }),
  },
);
