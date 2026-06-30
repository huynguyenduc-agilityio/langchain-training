'use client';

import type { DriverMatchCardProps } from '@/types';
import { Car, CheckCircle2, Phone, ShieldCheck, Star } from 'lucide-react';

import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function DriverMatchCard({
  tripId,
  driver,
  etaMinutes,
  onMount,
}: DriverMatchCardProps) {
  // Notify parent once on mount so it can sync trips state.
  useEffect(() => {
    onMount?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-emerald-950/40 shadow-lg shadow-emerald-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-emerald-950/15">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="font-bold text-xs text-emerald-400">
          Driver Found!
        </span>
        <Badge
          variant="outline"
          className="ml-auto bg-emerald-950/40 text-emerald-450 border-emerald-900/30 hover:bg-emerald-950/40 text-[9px] font-bold px-2 py-0.5 rounded-lg border-solid"
        >
          #{tripId.split('-').pop()}
        </Badge>
      </div>

      {/* Driver info */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-955 border border-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-gray-150">
                  {driver.name}
                </span>
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 bg-amber-950/30 px-1.5 py-0.5 rounded-md shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                  {driver.rating}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {driver.vehicleInfo} ·{' '}
                <span className="font-bold text-gray-200">
                  {driver.licensePlate}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-850/50 pt-2.5 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-550" />
            Driver phone:{' '}
            <strong className="text-gray-300 font-semibold">
              {driver.phone}
            </strong>
          </span>
          <span className="bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded-lg text-emerald-400 font-bold text-[10px] animate-pulse">
            Arriving in ~{etaMinutes} min
          </span>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-emerald-500/80 font-bold pt-1.5 border-t border-gray-855/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Driver has been verified and approved by the system.</span>
        </div>
      </CardContent>
    </Card>
  );
}
