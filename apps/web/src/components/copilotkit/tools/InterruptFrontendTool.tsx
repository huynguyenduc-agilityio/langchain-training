'use client';

import React from 'react';
import { useInterrupt } from '@copilotkit/react-core/v2';
import type { Trip } from '@/types';
import { RideConfirmCard } from '@/components/RideConfirmCard';
import { CancelTripCard } from '@/components/CancelTripCard';
import { useAuth } from '@/features/auth/auth-context';

interface InterruptFrontendToolProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function InterruptFrontendTool({
  trips,
  setTrips,
}: InterruptFrontendToolProps) {
  const { user } = useAuth();

  useInterrupt({
    render: ({ event, resolve }) => {
      console.log('useInterrupt triggered! event:', JSON.stringify(event));

      let parsedValue = event.value;
      if (typeof parsedValue === 'string') {
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch (e) {
          console.error('Failed to parse event.value:', e);
        }
      }

      const type = parsedValue?.type;
      const data = parsedValue?.data;

      if (type === 'ride_confirm' && data) {
        return (
          <RideConfirmCard
            pickup={data.pickup || ''}
            destination={data.destination || ''}
            distance={data.distance || 0}
            duration={data.duration || 0}
            vehicleType={data.vehicleType || 'bike'}
            passengerName={data.passengerName || ''}
            passengerPhone={data.passengerPhone || ''}
            price={data.price || 0}
            onConfirm={() => {
              const newTripId = `TRP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
              const newTrip: Trip = {
                id: newTripId,
                userId: user?.uid || 'mock-google-user-123',
                pickup: data.pickup || '',
                destination: data.destination || '',
                distance: data.distance || 0,
                duration: data.duration || 0,
                vehicleType: data.vehicleType || 'bike',
                passengerName: data.passengerName || '',
                passengerPhone: data.passengerPhone || '',
                price: data.price || 0,
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
      }

      if (type === 'cancel_confirm' && data) {
        const trip = trips.find((t) => t.id === data.tripId);
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
                    : t,
                ),
              );

              // Resolve interrupt back to agent
              resolve({ approved: true });
            }}
            onReject={() => {
              resolve({ approved: false });
            }}
          />
        );
      }

      return <></>;
    },
  });

  return null;
}
