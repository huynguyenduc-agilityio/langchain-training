'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { RideBookingContainer } from '@/features/ride-booking/components/RideBookingContainer';
import { CopilotKitTools } from '@/components/copilotkit/CopilotKitTools';
import { ChatSidebar } from '@/components/copilotkit/ChatSidebar';
import type { Trip } from '@/types';

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-100">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <RideBookingContainer trips={trips} setTrips={setTrips} />
      </main>

      {/* CopilotKit Tools for agent/frontend interaction */}
      <CopilotKitTools trips={trips} setTrips={setTrips} />

      {/* CopilotSidebar: renders as position:fixed and auto-manages body margin */}
      <ChatSidebar />
    </div>
  );
}
