'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { COPILOT_TOOLS } from '@repo/shared';
import { CancelSuccessCard } from '@/components/CancelSuccessCard';
import { CancelTripErrorCard } from '@/components/CancelTripErrorCard';

export function CancelRideRenderTool() {
  const parametersSchema = z.object({
    success: z.boolean().describe('Whether the cancellation was successful'),
    tripId: z.string().optional().describe('The trip ID'),
    pickup: z.string().optional().describe('Pickup location name'),
    destination: z.string().optional().describe('Destination location name'),
    driverName: z
      .string()
      .optional()
      .describe('Assigned driver name of the cancelled trip'),
    price: z.number().optional().describe('Total price of the ride'),
    vehicleType: z
      .enum(['bike', 'car4', 'car7'])
      .optional()
      .describe('Vehicle type of the ride'),
    passengerName: z.string().optional().describe('Passenger name of the ride'),
    passengerPhone: z
      .string()
      .optional()
      .describe('Passenger phone of the ride'),
    reason: z
      .string()
      .optional()
      .describe('Reason for cancellation failure (if success is false)'),
  });

  useRenderTool({
    name: COPILOT_TOOLS.CANCEL_RIDE.name,
    parameters: parametersSchema,
    render: ({ parameters: args }) => {
      if (args.success) {
        return (
          <CancelSuccessCard
            tripId={args.tripId || ''}
            pickup={args.pickup || ''}
            destination={args.destination || ''}
            driverName={args.driverName}
            price={args.price}
            vehicleType={args.vehicleType}
            passengerName={args.passengerName}
            passengerPhone={args.passengerPhone}
          />
        );
      }

      return (
        <CancelTripErrorCard tripId={args.tripId} reason={args.reason || ''} />
      );
    },
  });

  return null;
}
