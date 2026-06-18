'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import { CopilotModalHeader } from '@copilotkit/react-core/v2';

export type CustomChatHeaderProps = {
  onReset: () => void;
} & ComponentProps<typeof CopilotModalHeader>;

export function CustomChatHeader({ onReset, ...props }: CustomChatHeaderProps) {
  return (
    <div className="relative w-full">
      <CopilotModalHeader {...props} />
      <button
        onClick={onReset}
        title="Reset conversation"
        className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors duration-200 z-10 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  );
}
