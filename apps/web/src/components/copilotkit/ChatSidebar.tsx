'use client';

import React, { useEffect, useRef } from 'react';
import {
  CopilotSidebar,
  useConfigureSuggestions,
  useCopilotChatConfiguration,
  CopilotModalHeader,
} from '@copilotkit/react-core/v2';

function CustomHeader(props: any) {
  const config = useCopilotChatConfiguration();
  const hasClosed = useRef(false);

  useEffect(() => {
    if (config && !hasClosed.current) {
      config.setModalOpen(false);
      hasClosed.current = true;
    }
  }, [config]);

  return <CopilotModalHeader {...props} />;
}

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
      defaultOpen={false}
      header={CustomHeader as any}
      labels={{
        modalHeaderTitle: 'CityRide AI',
        welcomeMessageText: 'Hello! 👋. Where would you like to go today?',
        chatDisclaimerText: '',
        chatInputPlaceholder: 'Type a message...',
      }}
    />
  );
}
