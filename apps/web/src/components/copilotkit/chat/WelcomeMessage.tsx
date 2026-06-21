'use client';

import React from 'react';
import { AssistantAvatar } from './AssistantAvatar';

export function WelcomeMessage() {
  return (
    <div className="flex items-start gap-2.5 py-3 select-text">
      <AssistantAvatar />
      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-[14px] rounded-tl-[4px] px-3.5 py-2.5 max-w-[85%]">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          Hello! 👋 Where would you like to go today?
        </p>
      </div>
    </div>
  );
}
