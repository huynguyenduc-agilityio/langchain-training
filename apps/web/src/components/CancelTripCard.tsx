'use client';

import type { CancelTripCardProps } from '@/types';
import { CARD_STATUS } from '@/constants';
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  SkipForward,
  Trash2,
  Undo2,
} from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CancelTripCard({
  tripId,
  pickup,
  destination,
  driverName,
  disabled = false,
  onConfirm,
  onReject,
  status = CARD_STATUS.PENDING,
}: CancelTripCardProps) {
  const [decided, setDecided] = useState<
    typeof CARD_STATUS.CONFIRMED | typeof CARD_STATUS.REJECTED | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setDecided(CARD_STATUS.CONFIRMED);
    onConfirm?.();
  };

  const handleReject = () => {
    setDecided(CARD_STATUS.REJECTED);
    onReject?.();
  };

  if (status && status !== CARD_STATUS.PENDING) {
    return (
      <Card className="rounded-xl overflow-hidden my-1 bg-gray-900/30 border border-gray-855 border-solid max-w-full font-sans">
        {/* Compact Header */}
        <div className="px-3.5 py-2 flex items-center justify-between bg-gray-950/20 border-b border-gray-855/50 border-solid">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
            <span>Trip Cancellation</span>
          </div>

          {/* Status Pill */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-solid flex items-center gap-1 uppercase tracking-wider ${
              status === CARD_STATUS.CONFIRMED
                ? 'bg-red-950/40 text-red-400 border-red-900/40'
                : status === CARD_STATUS.REJECTED
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700/50'
            }`}
          >
            {status === CARD_STATUS.CONFIRMED ? (
              <>
                <Trash2 className="w-2.5 h-2.5" />
                <span>Cancelled</span>
              </>
            ) : status === CARD_STATUS.REJECTED ? (
              <>
                <Undo2 className="w-2.5 h-2.5" />
                <span>Kept Active</span>
              </>
            ) : (
              <>
                <SkipForward className="w-2.5 h-2.5" />
                <span>Bypassed</span>
              </>
            )}
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-3 text-[11px] space-y-2 text-gray-300">
          <div className="flex items-start gap-1 flex-wrap">
            <span className="font-semibold text-gray-500 shrink-0">Trip:</span>
            <span className="font-mono text-gray-450 font-bold shrink-0">
              #{tripId.split('-').pop()}
            </span>
            <span className="text-gray-700 font-bold shrink-0">•</span>
            <span className="font-bold flex items-center gap-1 leading-normal flex-wrap">
              <span>{pickup}</span>
              <ArrowRight className="w-3 h-3 text-gray-650 shrink-0" />
              <span>{destination}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400 leading-normal">
            {driverName && (
              <>
                <div>
                  <span className="font-semibold text-gray-500">Driver:</span>{' '}
                  <span className="text-gray-200">{driverName}</span>
                </div>
                <span className="text-gray-700 font-bold">•</span>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

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
      </CardContent>

      <Separator className="bg-gray-850" />

      {/* Actions */}
      <div className="p-3 flex gap-2">
        {decided ? (
          <div
            className={`w-full text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              decided === CARD_STATUS.CONFIRMED
                ? 'bg-red-950/40 text-red-400 border border-red-900/20'
                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
            } border-solid`}
          >
            {decided === CARD_STATUS.CONFIRMED ? (
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
              disabled={disabled}
              className="flex-1 bg-red-650 hover:bg-red-550 text-white! font-semibold rounded-xl h-10 border-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Trip
            </Button>
            <Button
              id="btn-keep-trip"
              onClick={handleReject}
              variant="outline"
              disabled={disabled}
              className="flex-1 bg-gray-955 border-gray-850 hover:bg-gray-850 text-gray-400 hover:text-emerald-400 rounded-xl h-10 border-solid flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
