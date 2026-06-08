'use client';

import React from 'react';
import type { TripStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface TripStatusBadgeProps {
  status: TripStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  searching: {
    label: 'Searching',
    className: 'bg-amber-950/45 text-amber-400 border-amber-500/20 hover:bg-amber-950/45',
    dotColor: 'bg-amber-400 animate-ping',
  },
  matched: {
    label: 'Matched',
    className: 'bg-sky-950/45 text-sky-400 border-sky-500/20 hover:bg-sky-950/45',
    dotColor: 'bg-sky-400',
  },
  picked_up: {
    label: 'In Transit',
    className: 'bg-indigo-950/45 text-indigo-400 border-indigo-500/20 hover:bg-indigo-950/45',
    dotColor: 'bg-indigo-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-950/45 text-emerald-400 border-emerald-500/20 hover:bg-emerald-950/45',
    dotColor: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-950/45 text-red-400 border-red-500/20 hover:bg-red-950/45',
    dotColor: 'bg-red-400',
  },
} as const;

export function TripStatusBadge({
  status,
  size = 'sm',
}: TripStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: 'Unknown',
    className: 'bg-gray-950 text-gray-400 border-gray-800',
    dotColor: 'bg-gray-400',
  };
  
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 rounded-full' : 'text-xs px-3 py-1 rounded-full';

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses} gap-1.5 font-bold transition-all border-solid`}
    >
      <span className={`relative flex h-1.5 w-1.5 shrink-0`}>
        {status === 'searching' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotColor.replace('animate-ping', '')}`} />
      </span>
      {config.label}
    </Badge>
  );
}
