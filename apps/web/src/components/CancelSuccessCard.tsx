'use client';

import type { CancelSuccessCardProps } from '@/types';
import { ArrowRight, CheckCircle2, MapPin, Trash2 } from 'lucide-react';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/utils';

export function CancelSuccessCard({
  tripId,
  pickup,
  destination,
  cancellationFee,
}: CancelSuccessCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-gray-850 shadow-lg shadow-gray-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-gradient-to-r from-red-950/15 to-transparent">
        <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
        <span className="font-bold text-xs text-gray-400">Trip Cancelled</span>
        <Badge
          variant="outline"
          className="ml-auto bg-gray-955 text-gray-400 border-gray-800 hover:bg-gray-955 text-[9px] font-bold px-2 py-0.5 rounded-lg border-solid"
        >
          #{tripId.split('-').pop()}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Route */}
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-gray-400 font-semibold truncate max-w-[100px] line-through">
            {pickup}
          </span>
          <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
          <span className="text-gray-400 font-semibold truncate max-w-[100px] line-through">
            {destination}
          </span>
        </div>

        {/* Cancellation fee */}
        {cancellationFee > 0 ? (
          <div className="bg-red-950/15 border border-red-900/10 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-400">
            <span className="font-semibold flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />
              Cancellation fee charged:
            </span>
            <strong className="font-black text-sm">
              {formatPrice(cancellationFee)}
            </strong>
          </div>
        ) : (
          <div className="bg-emerald-950/15 border border-emerald-900/10 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">No cancellation fee applied</span>
          </div>
        )}

        <p className="text-[10px] text-gray-500 font-medium pt-1">
          This trip has been cancelled and removed from your active rides.
        </p>
      </CardContent>
    </Card>
  );
}
