'use client';

import type { Trip } from '@repo/shared';
import { useAgent, useInterrupt } from '@copilotkit/react-core/v2';
import React, { useEffect, useState } from 'react';

import { CancelTripCard } from '@/components/CancelTripCard';
import { useAgentStore } from '@/store/useAgentStore';
import { COPILOTKIT_AGENT_ID } from '@/constants';
import type {
  CancelConfirmEventData,
  CancelConfirmResolveValue,
} from '@/types';
import { getEventData, getEventType } from '@/utils';
import { AssistantMessageLayout } from '../chat/AssistantMessage';

type CancelTripInterruptToolProps = {
  trips: Trip[];
};

function InterruptCancelConfirmRenderer({
  eventValue,
  resolve,
  messages,
  trips,
}: {
  eventValue: unknown;
  resolve: (value: CancelConfirmResolveValue) => void;
  messages: Array<{ role: string }>;
  trips: Trip[];
}) {
  const setActiveResolve = useAgentStore((state) => state.setActiveResolve);
  const [initialMessagesLength] = useState(messages.length);

  useEffect(() => {
    const stableResolve = (value: CancelConfirmResolveValue) => {
      setActiveResolve(null);
      resolve(value);
    };

    setActiveResolve(stableResolve);
    return () => {
      setActiveResolve(null);
    };
  }, [setActiveResolve, resolve]);

  const data = getEventData<CancelConfirmEventData>(eventValue);
  if (!data) return <></>;

  // Card is disabled if any new user message is appended to chat history since mount
  const disabled = messages
    .slice(initialMessagesLength)
    .some((msg) => msg.role === 'user');

  const trip = trips.find((t) => t.id === data.tripId);
  const pickup = trip?.pickup || data.pickup || '';
  const destination = trip?.destination || data.destination || '';
  const driverName = trip?.driver?.name || data.driverName;
  const cancellationFee = data.cancellationFee ?? 0;

  return (
    <AssistantMessageLayout>
      <CancelTripCard
        tripId={data.tripId || ''}
        pickup={pickup}
        destination={destination}
        driverName={driverName}
        cancellationFee={cancellationFee}
        disabled={disabled}
        onConfirm={() => {
          resolve({ approved: true });
        }}
        onReject={() => {
          resolve({ approved: false, cancelled: true });
        }}
      />
    </AssistantMessageLayout>
  );
}

export function CancelTripInterruptTool({
  trips,
}: CancelTripInterruptToolProps) {
  const { agent } = useAgent({ agentId: COPILOTKIT_AGENT_ID });
  const messages = agent?.messages || [];

  useInterrupt({
    agentId: COPILOTKIT_AGENT_ID,
    enabled: (event) => getEventType(event.value) === 'cancel_confirm',
    render: ({ event, resolve }) => {
      return (
        <InterruptCancelConfirmRenderer
          eventValue={event.value}
          resolve={resolve}
          messages={messages}
          trips={trips}
        />
      );
    },
  });

  return null;
}
