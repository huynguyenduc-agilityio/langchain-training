'use client';

import React, { useRef } from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
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
  const resolveRef = useRef<((value: any) => void) | null>(null);

  useFrontendTool({
    name: 'showRideConfirm',
    description:
      'Display the final ride request details (pickup, destination, vehicle, passenger name, phone, price) to the user for approval or cancellation.',
    parameters: z.object({
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      distance: z.number().describe('The ride distance in km'),
      duration: z.number().describe('The travel duration in minutes'),
      vehicleType: z
        .enum(['bike', 'car4', 'car7'])
        .describe('The selected vehicle type'),
      passengerName: z.string().describe('The passenger name'),
      passengerPhone: z.string().describe('The passenger phone number'),
      price: z.number().describe('The total ride price'),
    }),
    handler: async (args) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    render: ({ args }) => {
      return (
        <RideConfirmCard
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          distance={args.distance || 0}
          duration={args.duration || 0}
          vehicleType={args.vehicleType || 'bike'}
          passengerName={args.passengerName || ''}
          passengerPhone={args.passengerPhone || ''}
          price={args.price || 0}
          onConfirm={() => {
            const newTripId = `TRP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newTrip: Trip = {
              id: newTripId,
              userId: user?.uid || 'mock-google-user-123',
              pickup: args.pickup || '',
              destination: args.destination || '',
              distance: args.distance || 0,
              duration: args.duration || 0,
              vehicleType: args.vehicleType || 'bike',
              passengerName: args.passengerName || '',
              passengerPhone: args.passengerPhone || '',
              price: args.price || 0,
              status: 'searching',
              createdAt: new Date().toISOString(),
            };

            // Add new trip to state
            setTrips((prev) => [newTrip, ...prev]);

            // Resolve promise back to agent
            if (resolveRef.current) {
              resolveRef.current({ approved: true, tripId: newTripId });
              resolveRef.current = null;
            }

            // Simulate Driver Matching search
            setTimeout(() => {
              setTrips((prev) =>
                prev.map((t) =>
                  t.id === newTripId
                    ? {
                        ...t,
                        status: 'matched',
                        driver: {
                          name: 'Nguyen Van A',
                          phone: '+84905123456',
                          vehicleInfo:
                            args.vehicleType === 'bike'
                              ? 'Honda Vision (Black)'
                              : args.vehicleType === 'car4'
                                ? 'Toyota Vios (Silver)'
                                : 'Mitsubishi Xpander (White)',
                          licensePlate: '43A-999.99',
                          rating: 4.9,
                        },
                      }
                    : t,
                ),
              );
            }, 4000);
          }}
          onCancel={() => {
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
