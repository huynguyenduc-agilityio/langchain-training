'use client';

import type { VehicleType } from '@/types';
import {
  useAgent,
  useCopilotKit,
  useFrontendTool,
} from '@copilotkit/react-core/v2';
import React, { useCallback } from 'react';

import { z } from 'zod';
import { RideEstimateCard } from '@/components/RideEstimateCard';
import { COPILOT_TOOLS, VEHICLE_NAMES } from '@/constants';

type RideEstimateFrontendToolProps = {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function RideEstimateFrontendTool({
  onSelectVehicle,
}: RideEstimateFrontendToolProps) {
  const { agent } = useAgent({ agentId: 'default' });
  const { copilotkit } = useCopilotKit();

  const handleSelectVehicle = useCallback(
    (vehicleType: VehicleType) => {
      const displayName = VEHICLE_NAMES[vehicleType] ?? vehicleType;
      agent.addMessage({
        id: `msg-select-vehicle-${Date.now()}`,
        role: 'user',
        content: `Let's go with ${displayName}.`,
      });
      copilotkit.runAgent({ agent });
      onSelectVehicle?.(vehicleType);
    },
    [agent, copilotkit, onSelectVehicle],
  );

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
      return { displayed: true };
    },
    render: ({ args }) => {
      return (
        <RideEstimateCard
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          distance={args.distance || 0}
          duration={args.duration || 0}
          options={args.options || []}
          onSelectVehicle={handleSelectVehicle}
        />
      );
    },
  });

  return null;
}
