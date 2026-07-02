'use client';

import { useAgent, useInterrupt } from '@copilotkit/react-core/v2';
import React, { useEffect, useState } from 'react';

import { RideConfirmCard } from '@/components/RideConfirmCard';
import { useAgentStore } from '@/store/useAgentStore';
import { generateTripId, getEventData, getEventType } from '@/utils';
import { COPILOTKIT_AGENT_ID } from '@/constants';
import type { RideConfirmEventData, RideConfirmResolveValue } from '@/types';
import { AssistantMessageLayout } from '../chat/AssistantMessage';

function InterruptRideConfirmRenderer({
  eventValue,
  resolve,
  messages,
}: {
  eventValue: unknown;
  resolve: (value: RideConfirmResolveValue) => void;
  messages: Array<{ role: string }>;
}) {
  const setActiveResolve = useAgentStore((state) => state.setActiveResolve);
  const [initialMessagesLength] = useState(messages.length);

  useEffect(() => {
    const stableResolve = (value: RideConfirmResolveValue) => {
      setActiveResolve(null);
      resolve(value);
    };

    setActiveResolve(stableResolve);
    return () => {
      setActiveResolve(null);
    };
  }, [setActiveResolve, resolve]);

  const data = getEventData<RideConfirmEventData>(eventValue);
  if (!data) return <></>;

  // Card is disabled if any new user message is appended to chat history since mount
  const disabled = messages
    .slice(initialMessagesLength)
    .some((msg) => msg.role === 'user');

  return (
    <AssistantMessageLayout>
      <RideConfirmCard
        pickup={data.pickup || ''}
        destination={data.destination || ''}
        distance={data.distance || 0}
        duration={data.duration || 0}
        vehicleType={data.vehicleType || 'bike'}
        passengerName={data.passengerName || ''}
        passengerPhone={data.passengerPhone || ''}
        price={data.price || 0}
        disabled={disabled}
        onConfirm={(editedData) => {
          const newTripId = generateTripId();
          resolve({
            approved: true,
            tripId: newTripId,
            passengerName: editedData.passengerName,
            passengerPhone: editedData.passengerPhone,
            vehicleType: editedData.vehicleType,
          });
        }}
        onCancel={() => {
          resolve({ approved: false, cancelled: true });
        }}
      />
    </AssistantMessageLayout>
  );
}

export function ConfirmRideInterruptTool() {
  const { agent } = useAgent({ agentId: COPILOTKIT_AGENT_ID });
  const messages = agent?.messages || [];

  useInterrupt({
    agentId: COPILOTKIT_AGENT_ID,
    enabled: (event) => getEventType(event.value) === 'ride_confirm',
    render: ({ event, resolve }) => {
      return (
        <InterruptRideConfirmRenderer
          eventValue={event.value}
          resolve={resolve}
          messages={messages}
        />
      );
    },
  });

  return null;
}
