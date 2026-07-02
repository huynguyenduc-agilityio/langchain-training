'use client';

import { useRenderTool } from '@copilotkit/react-core/v2';
import React from 'react';
import { z } from 'zod';

import { CancelTripCard } from '@/components/CancelTripCard';
import { CARD_STATUS } from '@/constants';
import { COPILOT_TOOLS } from '@repo/shared';
import type { Trip } from '@repo/shared';

type CancelTripRenderToolProps = {
  trips: Trip[];
};

export function CancelTripRenderTool({ trips }: CancelTripRenderToolProps) {
  const parametersSchema = z.object({
    tripId: z.string().describe('The trip ID to cancel'),
  });

  useRenderTool({
    name: COPILOT_TOOLS.CANCEL_TRIP.name,
    parameters: parametersSchema,
    render: ({ parameters: args, result }) => {
      if (!result) {
        return <></>;
      }

      const trip = trips.find((t) => t.id === args.tripId);
      const pickup = trip?.pickup || '';
      const destination = trip?.destination || '';
      const driverName = trip?.driver?.name || undefined;
      const cancellationFee = trip?.driver ? 1.0 : 0;

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
        // cancelled is explicit cancellation or reject
        cancelled = obj.cancelled === true;
      }

      const cardStatus = approved
        ? CARD_STATUS.CONFIRMED
        : cancelled
          ? CARD_STATUS.CANCELLED
          : CARD_STATUS.BYPASSED;

      return (
        <CancelTripCard
          tripId={args.tripId || ''}
          pickup={pickup}
          destination={destination}
          driverName={driverName}
          cancellationFee={cancellationFee}
          disabled={true}
          status={
            cardStatus === CARD_STATUS.CANCELLED
              ? CARD_STATUS.REJECTED
              : cardStatus
          }
          onConfirm={() => {}}
          onReject={() => {}}
        />
      );
    },
  });

  return null;
}
