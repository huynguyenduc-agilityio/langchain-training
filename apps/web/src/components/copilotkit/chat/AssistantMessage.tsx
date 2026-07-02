'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import {
  CopilotChatAssistantMessage,
  CopilotChatToolCallsView,
} from '@copilotkit/react-core/v2';

import { DISPLAY_TOOL_NAMES } from '@repo/shared';
import { cn } from '@/utils/className';
import { ErrorBoundary } from '../../ErrorBoundary';
import { AssistantMessageErrorFallback } from './AssistantMessageErrorFallback';
import { TypingIndicator } from './TypingIndicator';
import { AssistantAvatar } from './AssistantAvatar';

type AssistantMessageLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function AssistantMessageLayout({
  children,
  className,
}: AssistantMessageLayoutProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 py-3 select-text w-full',
        className,
      )}
    >
      <AssistantAvatar />
      <div className="flex-1 flex flex-col gap-2 w-full max-w-[85%]">
        {children}
      </div>
    </div>
  );
}

type CopilotChatAssistantMessageProps = ComponentProps<
  typeof CopilotChatAssistantMessage
>;

function InnerAssistantMessage({
  message,
  messages,
  isRunning = false,
  className,
}: CopilotChatAssistantMessageProps) {
  const rawContent = message.content?.trim() ?? '';

  const hasToolCalls = Boolean(message.toolCalls?.length);
  const hasDisplayToolCalls = Boolean(
    message.toolCalls?.some((tc) => DISPLAY_TOOL_NAMES.has(tc.function.name)),
  );

  const hasContent = Boolean(rawContent);

  // If the last message in the list is currently rendering a display tool card (e.g. skeleton),
  // suppress the typing bubble — the card already serves as the loading indicator.
  const lastMsg = messages?.[messages.length - 1];
  const anyDisplayToolRunning = Boolean(
    lastMsg &&
    lastMsg.role === 'assistant' &&
    'toolCalls' in lastMsg &&
    (lastMsg.toolCalls as Array<{ function: { name: string } }>)?.some((tc) =>
      DISPLAY_TOOL_NAMES.has(tc.function.name),
    ),
  );
  const showTyping =
    isRunning && !hasContent && !hasToolCalls && !anyDisplayToolRunning;
  const showTextBubble = (hasContent && !hasDisplayToolCalls) || showTyping;

  if (!showTextBubble && !hasDisplayToolCalls) return null;

  return (
    <AssistantMessageLayout className={className}>
      {showTextBubble && (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-[14px] rounded-tl-[4px] px-3.5 py-2 font-sans text-sm text-[var(--text-primary)]">
          <div className="prose prose-sm dark:prose-invert max-w-full break-words text-[var(--text-primary)]">
            {showTyping ? (
              <TypingIndicator />
            ) : (
              <CopilotChatAssistantMessage.MarkdownRenderer
                content={message.content ?? ''}
              />
            )}
          </div>
        </div>
      )}

      {hasDisplayToolCalls && (
        <CopilotChatToolCallsView
          message={{
            ...message,
            toolCalls: message.toolCalls?.filter((tc) =>
              DISPLAY_TOOL_NAMES.has(tc.function.name),
            ),
          }}
          messages={messages}
        />
      )}
    </AssistantMessageLayout>
  );
}

export function AssistantMessage(props: CopilotChatAssistantMessageProps) {
  return (
    <ErrorBoundary fallback={<AssistantMessageErrorFallback />}>
      <InnerAssistantMessage {...props} />
    </ErrorBoundary>
  );
}
