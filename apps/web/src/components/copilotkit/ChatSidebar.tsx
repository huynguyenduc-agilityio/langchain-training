'use client';

import React from 'react';
import { CopilotSidebar, useConfigureSuggestions } from '@copilotkit/react-core/v2';

export function ChatSidebar() {
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
