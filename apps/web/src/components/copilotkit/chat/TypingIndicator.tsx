'use client';

import React from 'react';
import type { CopilotChatMessageView } from '@copilotkit/react-core/v2';

import { AssistantAvatar } from './AssistantAvatar';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 py-3 select-none">
      <AssistantAvatar />

      {/* Bubble with Typing Dots */}
      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-[14px] rounded-tl-[4px] px-3.5 py-2">
        <div className="flex items-center gap-1 py-1.5 px-0.5">
          <span
            className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

export const HiddenTypingIndicator: typeof CopilotChatMessageView.Cursor =
  () => <></>;
