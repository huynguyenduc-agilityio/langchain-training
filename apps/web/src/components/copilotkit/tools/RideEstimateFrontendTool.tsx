'use client';

import type { VehicleType } from '@/types';
import {
  useAgent,
  useCopilotKit,
  useFrontendTool,
} from '@copilotkit/react-core/v2';
import React, { useEffect, useRef } from 'react';

import { z } from 'zod';
import { RideEstimateCard } from '@/components/RideEstimateCard';
import { COPILOT_TOOLS } from '@/constants';

type RideEstimateFrontendToolProps = {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function RideEstimateFrontendTool({
  onSelectVehicle,
}: RideEstimateFrontendToolProps) {
  const { agent } = useAgent({ agentId: 'default' });
  const { copilotkit } = useCopilotKit();
  const hasTriggeredRun = useRef(false);

  useEffect(() => {
    if (!agent) return;
    const messages = agent.messages || [];
    const lastMessage = messages[messages.length - 1];
    if (
      hasTriggeredRun.current &&
      lastMessage &&
      lastMessage.role === 'tool' &&
      (lastMessage as typeof lastMessage & { name?: string }).name ===
        COPILOT_TOOLS.RENDER_RIDE_ESTIMATE.name &&
      !agent.isRunning
    ) {
      hasTriggeredRun.current = false;
      copilotkit.runAgent({ agent }).catch((err) => {
        console.error('Failed to resume agent after vehicle selection:', err);
      });
    }
  }, [agent, copilotkit]);

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
              hasTriggeredRun.current = true;
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
