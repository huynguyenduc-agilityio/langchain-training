'use client';

import type { VehicleType } from '@repo/shared';
import {
  useAgent,
  useCopilotKit,
  useFrontendTool,
} from '@copilotkit/react-core/v2';
import React, { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

import { RideEstimateCard } from '@/components/RideEstimateCard';
import { COPILOT_TOOLS, COPILOTKIT_AGENT_ID, VEHICLE_NAMES } from '@/constants';

type RideEstimateFrontendToolProps = {
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function RideEstimateFrontendTool({
  onSelectVehicle,
}: RideEstimateFrontendToolProps) {
  const { agent } = useAgent({ agentId: COPILOTKIT_AGENT_ID });
  const { copilotkit } = useCopilotKit();

  // Use refs so the stable callback always reads the latest values,
  // avoiding the stale-closure bug where useFrontendTool only captures
  // the render function once (on mount) and the provisional agent gets frozen in.
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
  }, []); // Empty deps — stable forever, always reads latest via refs

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
    render: ({ args, toolCallId }) => {
      // args stream in progressively as the LLM generates JSON.
      // Guard: only render once options has actually arrived —
      // otherwise an empty [] would flash the "Unable to estimate" error state.
      if (!args.options || args.options.length === 0) return null;

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
