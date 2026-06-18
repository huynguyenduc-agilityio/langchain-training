'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import { CopilotChatUserMessage } from '@copilotkit/react-core/v2';

export function UserMessage(
  props: ComponentProps<typeof CopilotChatUserMessage>,
) {
  return (
    <CopilotChatUserMessage
      {...props}
      toolbar={() => null}
      messageRenderer={({ content }) => (
        <div className="bg-[var(--accent-primary)] text-white relative max-w-[80%] rounded-[18px] rounded-tr-[4px] px-4 py-1.5 inline-block whitespace-pre-wrap text-[13px] shadow-sm">
          {content}
        </div>
      )}
    />
  );
}
