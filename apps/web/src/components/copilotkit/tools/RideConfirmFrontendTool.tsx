'use client';

import React from 'react';
import { useInterrupt } from '@copilotkit/react-core/v2';
import type { Trip } from '@/types';
import { RideConfirmCard } from '@/components/RideConfirmCard';
import { useAuth } from '@/features/auth/auth-context';

interface RideConfirmFrontendToolProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function RideConfirmFrontendTool({
  trips,
  setTrips,
}: RideConfirmFrontendToolProps) {
  const { user } = useAuth();

  useInterrupt({
    render: ({ event, resolve }) => {
      // Only handle ride_confirm interrupt events
      if (event.value?.type !== 'ride_confirm') return <></>;

      const tripDraft = event.value.data;
      if (!tripDraft) return <></>;

      return (
        <RideConfirmCard
          pickup={tripDraft.pickup || ''}
          destination={tripDraft.destination || ''}
          distance={tripDraft.distance || 0}
          duration={tripDraft.duration || 0}
          vehicleType={tripDraft.vehicleType || 'bike'}
          passengerName={tripDraft.passengerName || ''}
          passengerPhone={tripDraft.passengerPhone || ''}
          price={tripDraft.price || 0}
          onConfirm={() => {
            const newTripId = `TRP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newTrip: Trip = {
              id: newTripId,
              userId: user?.uid || 'mock-google-user-123',
              pickup: tripDraft.pickup || '',
              destination: tripDraft.destination || '',
              distance: tripDraft.distance || 0,
              duration: tripDraft.duration || 0,
              vehicleType: tripDraft.vehicleType || 'bike',
              passengerName: tripDraft.passengerName || '',
              passengerPhone: tripDraft.passengerPhone || '',
              price: tripDraft.price || 0,
              status: 'searching',
              createdAt: new Date().toISOString(),
            };

            // Add new trip to state
            setTrips((prev) => [newTrip, ...prev]);

            // Resolve interrupt
            resolve({ approved: true, tripId: newTripId });
          }}
          onCancel={() => {
            resolve({ approved: false });
          }}
        />
      );
    },
  });

  return null;
}
