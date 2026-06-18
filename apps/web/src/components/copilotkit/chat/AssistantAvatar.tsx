'use client';

import React from 'react';
import { cn } from '@/utils/className';

type AssistantAvatarProps = {
  className?: string;
};

export function AssistantAvatar({ className }: AssistantAvatarProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-glow)] mt-0.5',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </div>
  );
}
