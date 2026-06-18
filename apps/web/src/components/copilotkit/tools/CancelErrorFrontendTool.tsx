'use client';

import { useFrontendTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { CancelTripErrorCard } from '@/components/CancelTripErrorCard';
import { COPILOT_TOOLS } from '@/constants';

export function CancelErrorFrontendTool() {
  useFrontendTool({
    name: COPILOT_TOOLS.RENDER_CANCEL_ERROR.name,
    description: COPILOT_TOOLS.RENDER_CANCEL_ERROR.description,
    parameters: z.object({
      tripId: z.string().optional().describe('The trip ID (if available)'),
      reason: z
        .string()
        .describe(
          'The reason for cancellation failure (e.g. trip not found, already completed)',
        ),
    }),
    handler: async () => {
      return 'Displayed cancel error card';
    },
    render: ({ args }) => {
      return (
        <CancelTripErrorCard tripId={args.tripId} reason={args.reason || ''} />
      );
    },
  });

  return null;
}
