'use client';

import React, { useRef } from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import type { Trip } from '@/types';
import { CancelTripCard } from '@/components/CancelTripCard';

interface CancelConfirmFrontendToolProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function CancelConfirmFrontendTool({ trips, setTrips }: CancelConfirmFrontendToolProps) {
  const resolveRef = useRef<((value: any) => void) | null>(null);

  useFrontendTool({
    name: 'showCancelConfirm',
    description: 'Display the cancellation confirmation details for a trip using the trip ID.',
    parameters: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
    }),
    handler: async (args) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    render: ({ args }) => {
      const trip = trips.find((t) => t.id === args.tripId);
      if (!trip) return null;

      const driverMatched = !!trip.driver;
      const cancellationFee = driverMatched ? (trip.vehicleType === 'bike' ? 0.5 : 1.0) : 0;

      return (
        <CancelTripCard
          tripId={args.tripId || ''}
          pickup={trip.pickup || ''}
          destination={trip.destination || ''}
          driverName={trip.driver?.name}
          cancellationFee={cancellationFee}
          onConfirm={() => {
            // Cancel trip in state
            setTrips((prev) =>
              prev.map((t) =>
                t.id === args.tripId
                  ? {
                      ...t,
                      status: 'cancelled',
                      cancelledAt: new Date().toISOString(),
                      cancellationFee: cancellationFee,
                    }
                  : t
              )
            );

            if (resolveRef.current) {
              resolveRef.current({ approved: true });
              resolveRef.current = null;
            }
          }}
          onReject={() => {
            if (resolveRef.current) {
              resolveRef.current({ approved: false });
              resolveRef.current = null;
            }
          }}
        />
      );
    },
  });

  return null;
}
