'use client';

import type { VehicleType } from '@repo/shared';
import {
  useAgent,
  useCopilotKit,
  useRenderTool,
} from '@copilotkit/react-core/v2';
import React, { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

import { COPILOT_TOOLS } from '@repo/shared';
import { RideEstimateCard } from '@/components/RideEstimateCard';
import { COPILOTKIT_AGENT_ID, VEHICLE_NAMES } from '@/constants';

type RideEstimateRenderToolProps = {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function RideEstimateRenderTool({
  onSelectVehicle,
}: RideEstimateRenderToolProps) {
  const { agent } = useAgent({ agentId: COPILOTKIT_AGENT_ID });
  const { copilotkit } = useCopilotKit();

  const agentRef = useRef(agent);
  const copilotKitRef = useRef(copilotkit);
  const onSelectVehicleRef = useRef(onSelectVehicle);

  useEffect(() => {
    agentRef.current = agent;
  }, [agent]);

  useEffect(() => {
    copilotKitRef.current = copilotkit;
  }, [copilotkit]);

  useEffect(() => {
    onSelectVehicleRef.current = onSelectVehicle;
  }, [onSelectVehicle]);

  const handleSelectVehicle = useCallback(async (vehicleType: VehicleType) => {
    const currentAgent = agentRef.current;
    const currentCopilotKit = copilotKitRef.current;
    const displayName = VEHICLE_NAMES[vehicleType] ?? vehicleType;
    currentAgent.addMessage({
      id: `msg-select-vehicle-${Date.now()}`,
      role: 'user',
      content: `Let's go with ${displayName}.`,
    });
    onSelectVehicleRef.current?.(vehicleType);
    await currentCopilotKit.runAgent({ agent: currentAgent });
  }, []);

  const parametersSchema = z.object({
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
  });

  useRenderTool({
    name: COPILOT_TOOLS.RIDE_ESTIMATE.name,
    parameters: parametersSchema,
    render: ({ parameters: args, toolCallId }) => {
      if (!args.options || args.options.length === 0) return <></>;

      return (
        <RideEstimateCard
          toolCallId={toolCallId}
          pickup={args.pickup || ''}
          destination={args.destination || ''}
          distance={args.distance || 0}
          duration={args.duration || 0}
          options={args.options}
          onSelectVehicle={handleSelectVehicle}
        />
      );
    },
  });

  return null;
}
