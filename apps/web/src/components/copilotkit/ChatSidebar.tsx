'use client';

import type { ComponentProps } from 'react';
import {
  CopilotModalHeader,
  CopilotSidebar,
  useConfigureSuggestions,
  useCopilotChatConfiguration,
} from '@copilotkit/react-core/v2';
import React, { useEffect, useRef } from 'react';

function CustomHeader(props: ComponentProps<typeof CopilotModalHeader>) {
  const config = useCopilotChatConfiguration();
  const hasClosedRef = useRef(false);

  useEffect(() => {
    if (config && !hasClosedRef.current) {
      config.setModalOpen(false);
      hasClosedRef.current = true;
    }
  }, [config]);

  return <CopilotModalHeader {...props} />;
}

export function ChatSidebar() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: 'Request a ride',
        message: 'I want to request a ride',
      },
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
      header={CustomHeader as unknown as typeof CopilotModalHeader}
      messageView={{
        assistantMessage: {
          toolbarVisible: false,
        },
      }}
      labels={{
        modalHeaderTitle: 'CityRide AI',
        welcomeMessageText: 'Hello! 👋. Where would you like to go today?',
        chatDisclaimerText: '',
        chatInputPlaceholder: 'Type a message...',
      }}
    />
  );
}
