import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { VEHICLE_TYPES, AGENT_TOOLS } from '@/constants';

export const dummyRideConfirmTool = tool(async () => ({ success: true }), {
  name: AGENT_TOOLS.CONFIRM_RIDE.name,
  description: AGENT_TOOLS.CONFIRM_RIDE.description,
  schema: z.object({
    pickup: z.string().describe('The pickup location name'),
    destination: z.string().describe('The destination location name'),
    distance: z.number().describe('The ride distance in km'),
    duration: z.number().describe('The travel duration in minutes'),
    vehicleType: z.enum(VEHICLE_TYPES).describe('The selected vehicle type'),
    passengerName: z.string().describe('The passenger name'),
    passengerPhone: z.string().describe('The passenger phone number'),
    price: z.number().describe('The total ride price'),
  }),
});

export const dummyCancelConfirmTool = tool(async () => ({ success: true }), {
  name: AGENT_TOOLS.CONFIRM_CANCEL.name,
  description: AGENT_TOOLS.CONFIRM_CANCEL.description,
  schema: z.object({
    tripId: z.string().describe('The trip ID to cancel'),
  }),
});
