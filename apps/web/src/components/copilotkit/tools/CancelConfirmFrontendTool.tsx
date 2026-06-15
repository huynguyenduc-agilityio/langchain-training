'use client';

import React from 'react';
import { useInterrupt } from '@copilotkit/react-core/v2';
import type { Trip } from '@/types';
import { CancelTripCard } from '@/components/CancelTripCard';

interface CancelConfirmFrontendToolProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function CancelConfirmFrontendTool({ trips, setTrips }: CancelConfirmFrontendToolProps) {
  useInterrupt({
    render: ({ event, resolve }) => {
      // Only handle cancel_confirm interrupt events
      if (event.value?.type !== 'cancel_confirm') return <></>;

      const data = event.value.data;
      if (!data) return <></>;

      const trip = trips.find((t) => t.id === data.tripId);
      if (!trip) return <></>;
      const pickup = trip?.pickup || data.pickup || '';
      const destination = trip?.destination || data.destination || '';
      const driverName = trip?.driver?.name || data.driverName;
      const cancellationFee = data.cancellationFee ?? 0;

      return (
        <CancelTripCard
          tripId={data.tripId || ''}
          pickup={pickup}
          destination={destination}
          driverName={driverName}
          cancellationFee={cancellationFee}
          onConfirm={() => {
            // Cancel trip in state
            setTrips((prev) =>
              prev.map((t) =>
                t.id === data.tripId
                  ? {
                      ...t,
                      status: 'cancelled',
                      cancelledAt: new Date().toISOString(),
                      cancellationFee: cancellationFee,
                    }
                  : t
              )
            );

            // Resolve interrupt back to agent
            resolve({ approved: true });
          }}
          onReject={() => {
            resolve({ approved: false });
          }}
        />
      );
    },
  });

  return null;
}
