'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import type {
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatUserMessage,
  CopilotModalHeader,
} from '@copilotkit/react-core/v2';
import {
  CopilotSidebar,
  useAgent,
  useCopilotKit,
} from '@copilotkit/react-core/v2';

import { generateUUID } from '@/utils';

import { AssistantMessage } from './chat/AssistantMessage';
import { UserMessage } from './chat/UserMessage';
import { HiddenTypingIndicator, TypingIndicator } from './chat/TypingIndicator';
import { CustomChatHeader } from './chat/CustomChatHeader';
import { ChatInput } from './chat/ChatInput';

export function ChatSidebar() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const hasMessages = (agent?.messages?.length ?? 0) > 0;

  const agentRef = useRef(agent);
  useEffect(() => {
    agentRef.current = agent;
  }, [agent]);

  const handleStop = useCallback(async () => {
    try {
      const currentAgent = agentRef.current;
      if (currentAgent) {
        copilotkit.stopAgent({ agent: currentAgent });
        await currentAgent.detachActiveRun();
      }
    } catch (error) {
      console.warn('Failed to detach active run', { error });
    }
  }, [copilotkit]);

  const handleReset = useCallback(async () => {
    await handleStop();
    setThreadId(generateUUID());
  }, [handleStop]);

  // useConfigureSuggestions({
  //   suggestions: COPILOT_SUGGESTIONS,
  // });

  const Header = useCallback(
    (headerProps: ComponentProps<typeof CopilotModalHeader>) => (
      <CustomChatHeader {...headerProps} onReset={handleReset} />
    ),
    [handleReset],
  );

  return (
    <CopilotSidebar
      threadId={threadId}
      defaultOpen={false}
      header={Header as unknown as typeof CopilotModalHeader}
      onStop={handleStop}
      input={ChatInput as unknown as typeof CopilotChatInput}
      messageView={{
        assistantMessage:
          AssistantMessage as typeof CopilotChatAssistantMessage,
        userMessage: UserMessage as typeof CopilotChatUserMessage,
        cursor: hasMessages ? TypingIndicator : HiddenTypingIndicator,
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
