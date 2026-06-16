'use client';

import React from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { CancelSuccessCard } from '@/components/CancelSuccessCard';

export function CancelSuccessFrontendTool() {
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
