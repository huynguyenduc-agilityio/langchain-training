'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

import {
  checkHasVisibleMessages,
  createAndPersistThreadId,
  getPersistedThreadId,
} from '@/utils';
import { DISPLAY_TOOL_NAMES } from '@/constants';

import { AssistantMessage } from './chat/AssistantMessage';
import { UserMessage } from './chat/UserMessage';
import { HiddenTypingIndicator, TypingIndicator } from './chat/TypingIndicator';
import { CustomChatHeader } from './chat/CustomChatHeader';
import { ChatInput } from './chat/ChatInput';
import { WelcomeMessage } from './chat/WelcomeMessage';

export function ChatSidebar() {
  const { agent } = useAgent({ agentId: 'default' });
  const { copilotkit } = useCopilotKit();
  const [messageListEl, setMessageListEl] = useState<Element | null>(null);
  const [threadId, setThreadId] = useState<string>(getPersistedThreadId);
  const hasMessages = (agent?.messages?.length ?? 0) > 0;
  const hasVisibleMessages = checkHasVisibleMessages(
    agent?.messages as Array<{ role: string; content?: string }> | undefined,
  );

  // Hide the global typing cursor when a display tool card (e.g. skeleton) is already
  // rendering — the card serves as the visual loading state, making the "..." redundant.
  const hasDisplayToolRunning = Boolean(
    agent?.messages?.some(
      (m) =>
        m.role === 'assistant' &&
        'toolCalls' in m &&
        (m.toolCalls as Array<{ function: { name: string } }>)?.some((tc) =>
          DISPLAY_TOOL_NAMES.has(tc.function.name),
        ),
    ),
  );

  useEffect(() => {
    const find = () => {
      const el = document.querySelector('[data-testid="copilot-message-list"]');
      setMessageListEl(el ?? null);
    };
    // Small delay to ensure CopilotSidebar has mounted its DOM
    const t = setTimeout(find, 100);
    return () => clearTimeout(t);
  }, []);

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
    // Generate a fresh thread and persist it — old thread stays in DB but is no longer used.
    setThreadId(createAndPersistThreadId());
  }, [handleStop]);

  const Header = useCallback(
    (headerProps: ComponentProps<typeof CopilotModalHeader>) => (
      <CustomChatHeader {...headerProps} onReset={handleReset} />
    ),
    [handleReset],
  );

  return (
    <>
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
          cursor:
            hasMessages && !hasDisplayToolRunning
              ? TypingIndicator
              : HiddenTypingIndicator,
        }}
        labels={{
          modalHeaderTitle: 'CityRide AI',
        }}
      />

      {!hasVisibleMessages &&
        messageListEl &&
        createPortal(<WelcomeMessage />, messageListEl)}
    </>
  );
}
