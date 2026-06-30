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
    cancellationFee: z
      .number()
      .optional()
      .describe('Cancellation fee charged (0 if no fee)'),
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
            cancellationFee={args.cancellationFee || 0}
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
