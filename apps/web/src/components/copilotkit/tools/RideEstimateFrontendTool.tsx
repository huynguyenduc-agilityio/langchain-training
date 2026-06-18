'use client';

import type { VehicleType } from '@/types';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import React, { useRef } from 'react';

import { z } from 'zod';
import { RideEstimateCard } from '@/components/RideEstimateCard';
import { COPILOT_TOOLS } from '@/constants';

type RideEstimateFrontendToolProps = {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function RideEstimateFrontendTool({
  onSelectVehicle,
}: RideEstimateFrontendToolProps) {
  const resolveRef = useRef<
    ((value: { selectedVehicleType: VehicleType }) => void) | null
  >(null);

  useFrontendTool({
    name: COPILOT_TOOLS.RENDER_RIDE_ESTIMATE.name,
    description: COPILOT_TOOLS.RENDER_RIDE_ESTIMATE.description,
    parameters: z.object({
      pickup: z.string().describe('The pickup location name'),
      destination: z.string().describe('The destination location name'),
      distance: z.number().describe('The ride distance in km'),
      duration: z.number().describe('The travel duration in minutes'),
      options: z
        .array(
          z.object({
            vehicleType: z.enum(['bike', 'car4', 'car7']),
            price: z.number(),
          }),
        )
        .describe('Available ride options and prices'),
    }),
    handler: async () => {
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
