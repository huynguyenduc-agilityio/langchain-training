'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { COPILOT_TOOLS } from '@repo/shared';
import { TripsListCard } from '@/components/TripsListCard';

export function TripsListRenderTool() {
  const parametersSchema = z.object({
    trips: z.array(z.any()).describe('The list of user trips to render'),
  });

  useRenderTool({
    name: COPILOT_TOOLS.TRIPS_LIST.name,
    parameters: parametersSchema,
    render: ({ parameters: args }) => {
      const trips = args.trips || [];
      return <TripsListCard trips={trips} />;
    },
  });

  return null;
}
