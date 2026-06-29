'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import { Loader2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { z } from 'zod';

import { DriverMatchCard } from '@/components/DriverMatchCard';
import { DriverMatchErrorCard } from '@/components/DriverMatchErrorCard';
import { Card, CardContent } from '@/components/ui/card';
import { COPILOT_TOOLS } from '@/constants';
import type { Driver, Trip } from '@repo/shared';

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
          <div className="relative w-8 h-8 rounded-full bg-indigo-600/90 flex items-center justify-center text-white text-base shadow-lg shadow-indigo-500/30">
            🏍️
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

type DriverMatchRenderToolProps = {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

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

  useRenderTool({
    name: COPILOT_TOOLS.MATCH_DRIVER.name,
    parameters: z.object({
      tripId: z.string().describe('The trip ID to match a driver for'),
      vehicleType: z
        .enum(['bike', 'car4', 'car7'])
        .describe('The vehicle type of the request'),
      pickupLat: z.number().describe('Latitude of the pickup location'),
      pickupLng: z.number().describe('Longitude of the pickup location'),
    }),
    render: ({ status, result }) => {
      if (status === 'inProgress' || status === 'executing') {
        return <SearchingDriverCard />;
      }
      if (status === 'complete' && result) {
        try {
          const parsed =
            typeof result === 'string' ? JSON.parse(result) : result;
          if (parsed.success && parsed.driver) {
            return (
              <DriverMatchCard
                tripId={parsed.tripId}
                driver={parsed.driver}
                etaMinutes={parsed.etaMinutes}
                onMount={() =>
                  handleDriverMatched(parsed.tripId, parsed.driver)
                }
              />
            );
          } else {
            return (
              <DriverMatchErrorCard
                tripId={parsed.tripId || ''}
                reason={parsed.message || parsed.error || ''}
              />
            );
          }
        } catch (e) {
          console.error('Failed to parse matchDriver result:', e);
          return <></>;
        }
      }
      return <></>;
    },
  });

  return null;
}
