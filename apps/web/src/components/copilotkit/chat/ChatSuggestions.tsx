'use client';

import React from 'react';
import { COPILOT_SUGGESTIONS } from '@/constants';
import { cn } from '@/utils';

type ChatSuggestionsProps = {
  onSelect: (message: string) => void;
  disabled?: boolean;
};

export function ChatSuggestions({ onSelect, disabled }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-1 justify-start">
      {COPILOT_SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.title}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion.message)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer',
            'bg-[#06201b] border-[#0d3a31] text-[#10b981] hover:bg-[#059669] hover:text-white hover:border-[#059669]',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          )}
        >
          {suggestion.title}
        </button>
      ))}
    </div>
  );
}
