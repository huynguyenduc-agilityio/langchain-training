'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { CARD_STATUS } from '@/constants';
import { COPILOT_TOOLS } from '@repo/shared';
import { RideConfirmCard } from '@/components/RideConfirmCard';

export function ConfirmRideRenderTool() {
  const parametersSchema = z.object({
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
  });

  useRenderTool({
    name: COPILOT_TOOLS.CONFIRM_RIDE.name,
    parameters: parametersSchema,
    render: ({ parameters: args, result }) => {
      if (!result) {
        return <></>;
      }

      let approved = false;
      let cancelled = false;

      let parsedResult: unknown = result;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch {
          // ignore
        }
      }
      if (parsedResult && typeof parsedResult === 'object') {
        const obj = parsedResult as Record<string, unknown>;
        approved = obj.approved === true;
        cancelled = obj.cancelled === true;
      }

      const cardStatus = approved
        ? CARD_STATUS.CONFIRMED
        : cancelled
          ? CARD_STATUS.CANCELLED
          : CARD_STATUS.BYPASSED;

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
          disabled={true}
          status={cardStatus}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
    },
  });

  return null;
}
