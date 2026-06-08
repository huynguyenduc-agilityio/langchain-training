'use client';

import React, { useRef } from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import type { Trip } from '@/types';
import { CancelTripCard } from '@/components/CancelTripCard';

interface CancelConfirmFrontendToolProps {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function CancelConfirmFrontendTool({ setTrips }: CancelConfirmFrontendToolProps) {
  const resolveRef = useRef<((value: any) => void) | null>(null);

  useFrontendTool({
    name: 'showCancelConfirm',
    description: 'Display the cancellation confirmation details with the trip ID and fee warnings to the user.',
    parameters: z.object({
      tripId: z.string().describe('The trip ID to cancel'),
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      driverName: z.string().optional().describe('Name of the driver, if matched'),
      cancellationFee: z.number().optional().describe('Cancellation fee if applicable'),
    }),
    handler: async (args) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    render: ({ args }) => {
      return (
        <CancelTripCard
          tripId={args.tripId || ''}
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          driverName={args.driverName}
          cancellationFee={args.cancellationFee}
          onConfirm={() => {
            // Cancel trip in state
            setTrips((prev) =>
              prev.map((t) =>
                t.id === args.tripId
                  ? {
                      ...t,
                      status: 'cancelled',
                      cancelledAt: new Date().toISOString(),
                      cancellationFee: args.cancellationFee || 0,
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
