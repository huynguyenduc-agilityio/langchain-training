'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import {
  CopilotChatAssistantMessage,
  CopilotChatToolCallsView,
} from '@copilotkit/react-core/v2';

import { cn } from '@/utils/className';
import { DISPLAY_TOOL_NAMES } from '@/constants';
import { ErrorBoundary } from '../../ErrorBoundary';
import { AssistantMessageErrorFallback } from './AssistantMessageErrorFallback';
import { TypingIndicator } from './TypingIndicator';
import { AssistantAvatar } from './AssistantAvatar';

type CopilotChatAssistantMessageProps = ComponentProps<
  typeof CopilotChatAssistantMessage
>;

export function AssistantMessage({
  message,
  messages,
  isRunning = false,
  className,
}: CopilotChatAssistantMessageProps) {
  const hasContent = Boolean(message.content?.trim());
  const hasToolCalls = Boolean(message.toolCalls?.length);
  const hasDisplayToolCalls = Boolean(
    message.toolCalls?.some((tc) => DISPLAY_TOOL_NAMES.has(tc.function.name)),
  );
  const showTyping = isRunning && !hasContent && !hasToolCalls;
  const showTextBubble = hasContent || showTyping;

  if (!showTextBubble && !hasDisplayToolCalls) return null;

  return (
    <ErrorBoundary fallback={<AssistantMessageErrorFallback />}>
      <div
        className={cn('flex items-start gap-2.5 py-3 select-text', className)}
      >
        <AssistantAvatar />

        {/* Content Bubble & Tool Calls */}
        <div className="flex-1 flex flex-col gap-2 w-full max-w-[85%]">
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
        </div>
      </div>
    </ErrorBoundary>
  );
}
