'use client';

import type { DriverMatchErrorCardProps } from '@/types';
import { useAgent, useCopilotKit } from '@copilotkit/react-core/v2';
import { AlertTriangle, Loader2, RefreshCw, XCircle } from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { COPILOTKIT_AGENT_ID } from '@/constants';

export function DriverMatchErrorCard({
  tripId,
  reason,
}: DriverMatchErrorCardProps) {
  const { agent } = useAgent({ agentId: COPILOTKIT_AGENT_ID });
  const { copilotkit } = useCopilotKit();
  const [actionSelected, setActionSelected] = useState<
    'retry' | 'cancel' | null
  >(null);

  const handleRetry = async () => {
    setActionSelected('retry');
    agent.addMessage({
      id: `msg-retry-${Date.now()}`,
      role: 'user',
      content: `Retry driver matching for trip ${tripId}`,
    });
    await copilotkit.runAgent({ agent });
  };

  const handleCancel = async () => {
    setActionSelected('cancel');
    agent.addMessage({
      id: `msg-cancel-${Date.now()}`,
      role: 'user',
      content: `Cancel trip ${tripId}`,
    });
    await copilotkit.runAgent({ agent });
  };

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-red-950/40 shadow-lg shadow-red-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-red-950/15">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <span className="font-bold text-xs text-red-400">
          No Drivers Available
        </span>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-gray-300 leading-relaxed">
          {reason ||
            "We couldn't find any drivers matching your vehicle type nearby. All matching drivers are currently busy."}
        </p>

        {actionSelected ? (
          <div className="w-full text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-gray-955 border border-gray-855 border-solid text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            {actionSelected === 'retry'
              ? 'Retrying match...'
              : 'Cancelling booking...'}
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleRetry}
              className="flex-1 bg-gradient-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-white! font-semibold rounded-xl h-9 border-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Match
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 bg-gray-955 border-gray-855 hover:bg-gray-855 text-gray-400 hover:text-red-400 rounded-xl h-9 border-solid flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
