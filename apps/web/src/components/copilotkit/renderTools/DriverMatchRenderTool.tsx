'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React, { useCallback } from 'react';
import { z } from 'zod';

import { COPILOT_TOOLS } from '@repo/shared';
import { DriverMatchCard } from '@/components/DriverMatchCard';
import { DriverMatchErrorCard } from '@/components/DriverMatchErrorCard';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Loader2 } from 'lucide-react';
import type { Driver, Trip } from '@repo/shared';

type DriverMatchRenderToolProps = {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

function SearchingDriverCard() {
  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-indigo-950/40 shadow-lg shadow-indigo-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-indigo-950/15">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
        <span className="font-bold text-xs text-indigo-400">
          Finding your driver...
        </span>
      </div>
      {/* Content */}
      <CardContent className="p-4 flex flex-col items-center justify-center space-y-4 py-6">
        <div className="relative flex items-center justify-center w-14 h-14">
          {/* Waves animation */}
          <div className="absolute w-full h-full rounded-full border border-indigo-500/20 animate-ping" />
          <div className="absolute w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 animate-pulse" />
          <div className="relative w-8 h-8 rounded-full bg-indigo-600/90 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Car className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-gray-250">
            Locating nearest available drivers
          </p>
          <p className="text-[10px] text-gray-400 max-w-[200px] leading-normal mx-auto">
            Matching you with our driver partner. This will take just a few
            seconds...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DriverMatchRenderTool({
  setTrips,
}: DriverMatchRenderToolProps) {
  const handleDriverMatched = useCallback(
    (tripId: string, driver: Driver) => {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, status: 'matched' as const, driver } : t,
        ),
      );
    },
    [setTrips],
  );

  const parametersSchema = z.object({
    success: z.boolean().describe('Whether the driver match was successful'),
    tripId: z.string().describe('The trip ID'),
    driver: z.any().optional().describe('The matched driver details'),
    etaMinutes: z
      .number()
      .optional()
      .describe('Estimated time of arrival in minutes'),
    error: z.string().optional().describe('Error code on failure'),
    message: z.string().optional().describe('Error message on failure'),
  });

  // Render search state while the backend matchDriver tool is executing
  useRenderTool({
    name: 'matchDriver',
    parameters: z.object({
      tripId: z.string().optional(),
      vehicleType: z.string().optional(),
      pickupLat: z.number().optional(),
      pickupLng: z.number().optional(),
    }),
    render: ({ status }) => {
      if (status === 'inProgress' || status === 'executing') {
        return <SearchingDriverCard />;
      }
      return <></>;
    },
  });

  useRenderTool({
    name: COPILOT_TOOLS.DRIVER_MATCH.name,
    parameters: parametersSchema,
    render: ({ parameters: args }) => {
      if (args.success && args.driver) {
        return (
          <DriverMatchCard
            tripId={args.tripId || ''}
            driver={args.driver}
            etaMinutes={args.etaMinutes || 0}
            onMount={() => handleDriverMatched(args.tripId || '', args.driver)}
          />
        );
      } else {
        return (
          <DriverMatchErrorCard
            tripId={args.tripId || ''}
            reason={args.message || args.error || ''}
          />
        );
      }
    },
  });

  return null;
}
