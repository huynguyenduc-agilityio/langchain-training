'use client';

import type { Trip } from '@/types';
import { useInterrupt } from '@copilotkit/react-core/v2';

import React, { useEffect, useRef } from 'react';
import { CancelTripCard } from '@/components/CancelTripCard';
import { RideConfirmCard } from '@/components/RideConfirmCard';
import { useAuth } from '@/features/auth/auth-context';
import { useAgentStore } from '@/store/useAgentStore';
import { generateTripId } from '@/utils';
import { AssistantAvatar } from '../chat/AssistantAvatar';

type InterruptFrontendToolProps = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

export function InterruptFrontendTool({
  trips,
  setTrips,
}: InterruptFrontendToolProps) {
  const { user } = useAuth();
  const { threadId } = useAgentStore();

  const interruptCreatedAtThreadIdRef = useRef<string | null>(null);
  const prevEventSigRef = useRef<string | null>(null);
  const activeResolveRef = useRef<((value: unknown) => void) | null>(null);

  useEffect(() => {
    if (activeResolveRef.current) {
      activeResolveRef.current({ approved: false, cancelled: true });
      activeResolveRef.current = null;
    }
    // Reset event signature tracking and creation thread ID tracking on thread reset
    prevEventSigRef.current = null;
    interruptCreatedAtThreadIdRef.current = null;
  }, [threadId]);

  useInterrupt({
    render: ({ event, resolve }) => {
      const wrappedResolve = (value: unknown) => {
        activeResolveRef.current = null;
        resolve(value);
      };

      activeResolveRef.current = wrappedResolve;

      const currentEventSig =
        typeof event?.value === 'string'
          ? event.value
          : JSON.stringify(event?.value || '');

      if (prevEventSigRef.current !== currentEventSig) {
        prevEventSigRef.current = currentEventSig;
        interruptCreatedAtThreadIdRef.current = threadId;
      }

      if (!threadId || interruptCreatedAtThreadIdRef.current !== threadId) {
        return <></>;
      }

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

      const wrapWithAvatar = (element: React.ReactNode) => (
        <div className="flex items-start gap-2.5 py-3 select-text w-full">
          <AssistantAvatar />
          <div className="flex-1 flex flex-col gap-2 w-full max-w-[85%]">
            {element}
          </div>
        </div>
      );

      if (type === 'ride_confirm' && data) {
        return wrapWithAvatar(
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
              const newTripId = generateTripId();
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
              wrappedResolve({ approved: true, tripId: newTripId });
            }}
            onCancel={() => {
              wrappedResolve({ approved: false });
            }}
          />,
        );
      }

      if (type === 'cancel_confirm' && data) {
        const trip = trips.find((t) => t.id === data.tripId);
        const pickup = trip?.pickup || data.pickup || '';
        const destination = trip?.destination || data.destination || '';
        const driverName = trip?.driver?.name || data.driverName;
        const cancellationFee = data.cancellationFee ?? 0;

        return wrapWithAvatar(
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
                        cancellationFee,
                      }
                    : t,
                ),
              );

              // Resolve interrupt back to agent
              wrappedResolve({ approved: true });
            }}
            onReject={() => {
              wrappedResolve({ approved: false });
            }}
          />,
        );
      }

      return <></>;
    },
  });

  return null;
}
