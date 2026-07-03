'use client';

import type { Trip } from '@repo/shared';
import { CANCELLATION_FEE_CONFIG } from '@repo/shared';
import { useAgent, useInterrupt } from '@copilotkit/react-core/v2';
import React, { useEffect, useState } from 'react';

import { CancelTripCard } from '@/components/CancelTripCard';
import { CancellableTripsSelectorCard } from '@/components/CancellableTripsSelectorCard';
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
  const [selectedTripForConfirm, setSelectedTripForConfirm] =
    useState<Trip | null>(null);

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

  // Case 1: Multiple trips selection — 2-step flow
  if (data.is_selection) {
    const activeTripsList =
      data.trips ||
      trips.filter(
        (t) =>
          t.status === 'searching' ||
          t.status === 'matched' ||
          t.status === 'picked_up',
      );

    // Step 2: User already picked a trip → show CancelTripCard for final confirmation
    if (selectedTripForConfirm) {
      const cancellationFee = selectedTripForConfirm.driver
        ? (CANCELLATION_FEE_CONFIG[selectedTripForConfirm.vehicleType] ?? 1.0)
        : 0;

      return (
        <AssistantMessageLayout>
          <CancelTripCard
            tripId={selectedTripForConfirm.id}
            pickup={selectedTripForConfirm.pickup}
            destination={selectedTripForConfirm.destination}
            driverName={selectedTripForConfirm.driver?.name}
            cancellationFee={cancellationFee}
            disabled={disabled}
            onConfirm={() => {
              resolve({
                approved: true,
                selectedTripId: selectedTripForConfirm.id,
              });
            }}
            onReject={() => {
              // Step back to selector
              setSelectedTripForConfirm(null);
            }}
          />
        </AssistantMessageLayout>
      );
    }

    // Step 1: Show list of active trips, user picks one to cancel
    return (
      <AssistantMessageLayout>
        <CancellableTripsSelectorCard
          trips={activeTripsList}
          disabled={disabled}
          onSelectCancel={(tripId) => {
            // Advance to step 2: show confirm card for the selected trip
            const trip = activeTripsList.find((t) => t.id === tripId);
            if (trip) {
              setSelectedTripForConfirm(trip);
            }
          }}
          onBypass={() => {
            resolve({ approved: false, cancelled: true });
          }}
        />
      </AssistantMessageLayout>
    );
  }

  // Case 2: Single trip confirm card (agent already knows which trip)
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
