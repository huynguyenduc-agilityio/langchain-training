'use client';

import React, { useState } from 'react';
import {
  CopilotSidebar,
  useConfigureSuggestions,
} from '@copilotkit/react-core/v2';

import { AppHeader } from '@/components/AppHeader';
import { TripDashboard } from '@/components/TripDashboard';
import { SAMPLE_TRIPS } from '@/lib/data/sampleTrips';
import { CopilotKitTools } from '@/components/copilotkit/CopilotKitTools';
import type { Trip } from '@/types';

export default function RideBookingPage() {
  const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);

  const handleCancelTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationFee: t.driver ? 1.0 : 0, // Apply fee if driver already matched
            }
          : t,
      ),
    );
  };

  const handleEstimateRide = (pickup: string, destination: string) => {
    if (!pickup || !destination) return;
    const query = `Estimate a ride from ${pickup} to ${destination}`;

    // Copy the query message to the clipboard to assist the user in sending it easily
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(query);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-100">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <TripDashboard
          trips={trips}
          onCancelTrip={handleCancelTrip}
          onEstimateRide={handleEstimateRide}
        />
      </main>

      {/* CopilotKit Tools for agent/frontend interaction */}
      <CopilotKitTools trips={trips} setTrips={setTrips} />

      {/* CopilotSidebar: renders as position:fixed and auto-manages body margin */}
      <ChatSidebar />
    </div>
  );
}

function ChatSidebar() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: 'View my trips',
        message: 'Show me my trip history',
      },
      {
        title: 'Cancel a trip',
        message: 'I want to cancel a trip',
      },
    ],
  });

  return (
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        modalHeaderTitle: 'CityRide AI',
        welcomeMessageText: 'Hello! 👋. Where would you like to go today?',
        chatDisclaimerText: '',
        chatInputPlaceholder: 'Type a message...',
      }}
    />
  );
}
