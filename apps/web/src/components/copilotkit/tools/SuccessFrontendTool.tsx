'use client';

import React from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { RideSuccessCard } from '@/components/RideSuccessCard';
import { CancelSuccessCard } from '@/components/CancelSuccessCard';

export function SuccessFrontendTool() {
  useFrontendTool({
    name: 'showRideSuccess',
    description:
      'Display a success card after a ride has been booked and a driver matched successfully.',
    parameters: z.object({
      tripId: z.string().describe('The trip ID'),
      pickup: z.string().describe('Pickup location name'),
      destination: z.string().describe('Destination location name'),
      vehicleType: z.string().describe('Vehicle type (bike / car4 / car7)'),
      price: z.number().describe('Total fare price'),
      driver: z
        .object({
          name: z.string(),
          phone: z.string(),
          vehicleInfo: z.string(),
          licensePlate: z.string(),
          rating: z.number(),
        })
        .describe('Matched driver details'),
      etaMinutes: z.number().describe('Estimated arrival time in minutes'),
    }),
    handler: async () => {
      return 'Displayed ride success card';
    },
    render: ({ args }) => {
      if (!args.driver) return null;
      return (
        <RideSuccessCard
          tripId={args.tripId || ''}
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          vehicleType={args.vehicleType || 'bike'}
          price={args.price || 0}
          driver={args.driver}
          etaMinutes={args.etaMinutes || 3}
        />
      );
    },
  });

  useFrontendTool({
    name: 'showCancelSuccess',
    description:
      'Display a success card after a trip has been cancelled successfully.',
    parameters: z.object({
      tripId: z.string().describe('The cancelled trip ID'),
      pickup: z.string().describe('Pickup location name'),
      destination: z.string().describe('Destination location name'),
      cancellationFee: z
        .number()
        .describe('Cancellation fee charged (0 if no fee)'),
    }),
    handler: async () => {
      return 'Displayed cancel success card';
    },
    render: ({ args }) => {
      return (
        <CancelSuccessCard
          tripId={args.tripId || ''}
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          cancellationFee={args.cancellationFee || 0}
        />
      );
    },
  });

  return null;
}
