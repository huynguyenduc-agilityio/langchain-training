'use client';

import type { CancelTripCardProps } from '@/types';
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Trash2,
  Undo2,
} from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils';

export function CancelTripCard({
  tripId,
  pickup,
  destination,
  driverName,
  cancellationFee = 0,
  onConfirm,
  onReject,
}: CancelTripCardProps) {
  const [decided, setDecided] = useState<'confirmed' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setDecided('confirmed');
    onConfirm?.();
  };

  const handleReject = () => {
    setDecided('rejected');
    onReject?.();
  };

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-red-950/40 shadow-lg shadow-red-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-red-950/20 to-transparent border-b border-red-950/20 border-solid">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="font-bold text-xs text-red-400">
          Confirm Trip Cancellation
        </span>
      </div>

      {/* Details */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-550 font-semibold">Trip ID</span>
          <span className="font-mono font-bold text-gray-200">
            #{tripId.split('-').pop()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-550 font-semibold">Route</span>
          <span className="flex items-center gap-1 font-bold text-gray-200">
            <span className="truncate max-w-[95px]">{pickup}</span>
            <ArrowRight className="w-3 h-3 text-gray-550 shrink-0" />
            <span className="truncate max-w-[95px]">{destination}</span>
          </span>
        </div>

        {driverName && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-550 font-semibold">Assigned Driver</span>
            <span className="font-semibold text-gray-300">{driverName}</span>
          </div>
        )}

        {cancellationFee > 0 && (
          <div className="bg-red-950/15 border border-red-900/10 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-400">
            <span className="font-semibold flex items-center gap-1">
              ⚠️ Cancellation fee applies:
            </span>
            <strong className="font-black text-sm">
              {formatPrice(cancellationFee)}
            </strong>
          </div>
        )}
      </CardContent>

      <Separator className="bg-gray-850" />

      {/* Actions */}
      <div className="p-3 flex gap-2">
        {decided ? (
          <div
            className={`w-full text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              decided === 'confirmed'
                ? 'bg-red-950/40 text-red-400 border border-red-900/20'
                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
            } border-solid`}
          >
            {decided === 'confirmed' ? (
              <>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-400" />
                )}
                {loading ? 'Cancelling trip...' : 'Trip has been cancelled'}
              </>
            ) : (
              <>
                <Undo2 className="w-4 h-4 text-emerald-400" />
                Trip kept active
              </>
            )}
          </div>
        ) : (
          <>
            <Button
              id="btn-confirm-cancel"
              onClick={handleConfirm}
              className="flex-1 bg-red-650 hover:bg-red-550 text-white! font-semibold rounded-xl h-10 border-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/10"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Trip
            </Button>
            <Button
              id="btn-keep-trip"
              onClick={handleReject}
              variant="outline"
              className="flex-1 bg-gray-955 border-gray-850 hover:bg-gray-850 text-gray-400 hover:text-emerald-400 rounded-xl h-10 border-solid flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
              Keep Trip
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
