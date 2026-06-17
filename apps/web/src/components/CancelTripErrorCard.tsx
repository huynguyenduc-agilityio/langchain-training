'use client';

import type { CancelTripErrorCardProps } from '@/types';
import { AlertTriangle, Search, XCircle } from 'lucide-react';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function CancelTripErrorCard({
  tripId,
  reason,
}: CancelTripErrorCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-red-950/40 shadow-lg shadow-red-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-red-950/15">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <span className="font-bold text-xs text-red-400">
          Cancellation Failed
        </span>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {tripId && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-550 font-semibold">Trip ID</span>
            <span className="font-mono font-bold text-gray-200">
              #{tripId.split('-').pop()}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-red-300 bg-red-950/10 border border-red-900/10 rounded-xl p-2.5">
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {reason ||
              'An error occurred while trying to cancel this trip. Please try again.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium pt-1">
          <Search className="w-3 h-3" />
          <span>Try providing a valid trip ID or check your trip history.</span>
        </div>
      </CardContent>
    </Card>
  );
}
