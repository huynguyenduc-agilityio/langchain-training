'use client';

import type { CopilotChatInputProps } from '@copilotkit/react-core/v2';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { ChatSuggestions } from './ChatSuggestions';

const MAX_INPUT_HEIGHT = 120;
const PLACEHOLDER_INPUT = 'Type a message...';

export const ChatInput = ({
  onSubmitMessage,
  onStop,
  mode = 'input',
  value: controlledValue,
  onChange: onValueChange,
  isRunning = false,
  placeholder = PLACEHOLDER_INPUT,
  className,
}: CopilotChatInputProps & { placeholder?: string }) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = isControlled ? controlledValue : internalValue;
  const isProcessing = mode !== 'transcribe' && isRunning;
  const isInputDisabled = isProcessing;
  const shouldDisableSendButton = isProcessing
    ? !onStop
    : !value.trim() || !onSubmitMessage;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden';
  }, [value]);

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const submitMessage = (message: string) => {
    const trimmedMessage = message.trim();

    if (isInputDisabled || !trimmedMessage || !onSubmitMessage) return;

    onSubmitMessage(trimmedMessage);
    updateValue('');
  };

  const handleActionClick = () => {
    if (isProcessing) {
      onStop?.();
      return;
    }

    submitMessage(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    handleActionClick();
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(event.target.value);
  };

  const handleSelectSuggestion = (suggestionMessage: string) => {
    submitMessage(suggestionMessage);
  };

  const cleanClassName = className
    ? className
      .split(' ')
      .filter(
        (c) =>
          !c.includes('bg-background') &&
          !c.includes('border-t') &&
          !c.includes('border-border') &&
          !c.includes('px-') &&
          !c.includes('pb-') &&
          !c.includes('pt-') &&
          !c.includes('mx-') &&
          !c.includes('my-') &&
          !c.includes('mb-') &&
          !c.includes('mt-') &&
          !c.includes('ml-') &&
          !c.includes('mr-') &&
          !c.includes('m-') &&
          !c.includes('w-'),
      )
      .join(' ')
    : '';

  return (
    <div
      className={cn(
        'pointer-events-auto flex flex-col gap-3 bg-[#0a0a0a] w-full px-4 pt-4 pb-4 border-t border-[var(--border-subtle)]',
        cleanClassName,
      )}
    >
      <ChatSuggestions
        onSelect={handleSelectSuggestion}
        disabled={isInputDisabled}
      />

      <div
        className={cn(
          'flex items-center gap-2 w-full rounded-[24px] bg-[#2e2e30] px-4 py-2 transition-all border border-transparent',
          'focus-within:border-zinc-700/50',
          isInputDisabled && 'opacity-60 cursor-not-allowed bg-[#222224]',
        )}
      >
        <textarea
          ref={textareaRef}
          aria-label="Message"
          autoComplete="off"
          rows={1}
          value={value}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isInputDisabled}
          className={cn(
            'flex-1 resize-none border-none bg-transparent p-1 text-sm leading-relaxed overflow-hidden focus:outline-none focus:ring-0 self-center max-h-[120px] text-zinc-100 placeholder:text-zinc-400',
            isInputDisabled && 'cursor-not-allowed text-zinc-500',
          )}
        />

        <Button
          aria-label={isProcessing ? 'Stop response' : 'Send message'}
          type="button"
          onClick={handleActionClick}
          disabled={shouldDisableSendButton}
          className={cn(
            'size-8 rounded-full flex items-center justify-center p-0 transition-colors border-0 outline-none shrink-0',
            isProcessing
              ? 'bg-[#424244] text-zinc-100 hover:bg-[#525254]'
              : shouldDisableSendButton
                ? 'bg-[#222224] text-zinc-650 cursor-not-allowed opacity-50'
                : 'bg-[#424244] text-zinc-100 hover:bg-[#525254] hover:text-white',
          )}
        >
          {isProcessing ? (
            <Square className="size-3.5 fill-current" />
          ) : (
            <Send className="size-4 stroke-[2.5]" />
          )}
        </Button>
      </div>
    </div>
  );
};
