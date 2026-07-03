'use client';

import React from 'react';
import type { CancellableTripsSelectorCardProps } from '@/types';
import { CARD_STATUS } from '@/constants';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Navigation,
  SkipForward,
  Trash2,
  Undo2,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TripStatusBadge, VehicleBadge } from '@/components/ui/index';
import { formatPrice, formatRelativeTime } from '@/utils';

export function CancellableTripsSelectorCard({
  trips,
  disabled = false,
  onSelectCancel,
  onBypass: _onBypass,
  status = CARD_STATUS.PENDING,
}: CancellableTripsSelectorCardProps) {
  const hasActiveTrips = trips.length > 0;

  // Display compact status card if not pending
  if (status && status !== CARD_STATUS.PENDING) {
    return (
      <Card className="rounded-xl overflow-hidden my-1 bg-gray-900/30 border border-gray-855 border-solid max-w-full font-sans">
        <div className="px-3.5 py-2 flex items-center justify-between bg-gray-950/20 border-b border-gray-855/50 border-solid">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
            <span>Trip Management</span>
          </div>

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
        <div className="p-3 text-xs text-gray-450 italic">
          Trip selection request has expired or was bypassed.
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-red-950/20 shadow-lg shadow-red-950/5 max-w-sm w-full">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-950/20 to-transparent border-b border-solid border-gray-855 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-extrabold text-xs text-gray-100 uppercase tracking-wider">
            Select Trip to Cancel
          </span>
        </div>
        <span className="text-[10px] bg-red-950/50 text-red-400 font-bold px-2 py-0.5 rounded-full border border-solid border-red-900/30">
          {trips.length} active
        </span>
      </div>

      <CardContent className="p-3 flex flex-col gap-2.5">
        {!hasActiveTrips ? (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-500 font-medium">
              No cancellable trips found.
            </p>
          </div>
        ) : (
          trips.map((trip) => {
            const shortId = trip.id.split('-').pop();
            return (
              <div
                key={trip.id}
                className={`rounded-xl border border-solid border-gray-800 bg-gray-850/40 overflow-hidden transition-all duration-200 ${
                  disabled
                    ? 'opacity-50 grayscale-[20%]'
                    : 'hover:border-red-900/50 hover:bg-gray-850/60'
                }`}
              >
                {/* Trip top row: vehicle + id + price + status */}
                <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between border-b border-solid border-gray-800/60">
                  <div className="flex items-center gap-1.5">
                    <VehicleBadge type={trip.vehicleType} />
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      #{shortId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-400">
                      {formatPrice(trip.price)}
                    </span>
                    <TripStatusBadge status={trip.status} />
                  </div>
                </div>

                {/* Route */}
                <div className="px-3 py-2">
                  <div className="flex items-start gap-2">
                    {/* Route line visual */}
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <div className="w-px h-3 bg-gray-700" />
                      <Navigation className="w-3 h-3 text-red-400" />
                    </div>
                    {/* Route text */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span
                        title={trip.pickup}
                        className="text-xs font-semibold text-gray-200 truncate"
                      >
                        {trip.pickup}
                      </span>
                      <span
                        title={trip.destination}
                        className="text-xs text-gray-400 truncate"
                      >
                        {trip.destination}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: driver + time + cancel button */}
                <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span>{formatRelativeTime(trip.createdAt)}</span>
                    </div>
                    {trip.driver && (
                      <div className="flex items-center gap-1 min-w-0">
                        <User className="w-3 h-3 text-gray-600 shrink-0" />
                        <span className="truncate text-gray-400 font-medium">
                          {trip.driver.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => onSelectCancel(trip.id)}
                    disabled={disabled}
                    size="sm"
                    className="h-7 px-3 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white! border border-solid border-red-900/50 hover:border-transparent rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
