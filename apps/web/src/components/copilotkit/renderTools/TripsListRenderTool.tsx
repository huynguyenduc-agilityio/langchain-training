'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { TripsListCard } from '@/components/TripsListCard';
import { TripsListCardSkeleton } from '@/components/TripsListCardSkeleton';
import { COPILOT_TOOLS } from '@/constants';

export function TripsListRenderTool() {
  useRenderTool({
    name: COPILOT_TOOLS.LOOKUP_TRIPS.name,
    parameters: z.object({
      passengerPhone: z.string().optional().describe('Passenger phone number'),
      userId: z.string().optional().describe('User ID'),
    }),
    render: ({ status, result }) => {
      if (status === 'inProgress' || status === 'executing') {
        return <TripsListCardSkeleton />;
      }
      if (status === 'complete' && result) {
        try {
          const parsed =
            typeof result === 'string' ? JSON.parse(result) : result;
          if (parsed.success && parsed.trips) {
            return <TripsListCard trips={parsed.trips} />;
          }
        } catch (e) {
          console.error('Failed to parse lookupTrips result:', e);
        }
      }
      return <></>;
    },
  });

  return null;
}
