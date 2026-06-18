'use client';

import React from 'react';
import { AlertCircleIcon } from 'lucide-react';

import { CHATBOT_MESSAGES } from '@/constants';

export const AssistantMessageErrorFallback = () => (
  <div className="flex items-center gap-2 px-6 my-3 text-destructive text-sm">
    <AlertCircleIcon aria-hidden="true" className="size-3.5 shrink-0" />
    {CHATBOT_MESSAGES.ERROR_FALLBACK}
  </div>
);
