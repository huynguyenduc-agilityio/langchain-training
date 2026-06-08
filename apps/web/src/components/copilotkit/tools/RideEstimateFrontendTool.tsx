'use client';

import React, { useRef } from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import type { VehicleType } from '@/types';
import { RideEstimateCard } from '@/components/RideEstimateCard';

interface RideEstimateFrontendToolProps {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
}

export function RideEstimateFrontendTool({ onSelectVehicle }: RideEstimateFrontendToolProps) {
  const resolveRef = useRef<((value: any) => void) | null>(null);

  useFrontendTool({
    name: 'showRideEstimate',
    description: 'Display interactive fare choices and ride estimate to the user in a card.',
    parameters: z.object({
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      distance: z.number().describe('The ride distance in km'),
      duration: z.number().describe('The travel duration in minutes'),
      options: z.array(
        z.object({
          vehicleType: z.enum(['bike', 'car4', 'car7']),
          price: z.number(),
        })
      ).describe('Available ride options and prices'),
    }),
    handler: async (args) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    render: ({ args }) => {
      return (
        <RideEstimateCard
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          distance={args.distance || 0}
          duration={args.duration || 0}
          options={args.options || []}
          onSelectVehicle={(vehicleType) => {
            if (resolveRef.current) {
              resolveRef.current({ selectedVehicleType: vehicleType });
              resolveRef.current = null;
            }
            onSelectVehicle?.(vehicleType);
          }}
        />
      );
    },
  });

  return null;
}
