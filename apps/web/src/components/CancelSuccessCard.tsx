'use client';

import type { CancelSuccessCardProps } from '@/types';
import { ArrowRight, CheckCircle2, Phone, User } from 'lucide-react';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VehicleBadge } from '@/components/ui/index';
import { formatPrice } from '@/utils';

export function CancelSuccessCard({
  tripId,
  pickup,
  destination,
  driverName,
  price,
  vehicleType,
  passengerName,
  passengerPhone,
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
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-550 font-semibold">Route</span>
          <span className="flex items-center gap-1 font-bold text-gray-400 line-through">
            <span className="truncate max-w-[95px]">{pickup}</span>
            <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
            <span className="truncate max-w-[95px]">{destination}</span>
          </span>
        </div>

        {/* Driver (if any) */}
        {driverName && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-550 font-semibold">Assigned Driver</span>
            <span className="font-semibold text-gray-300">{driverName}</span>
          </div>
        )}

        {/* Passenger Info (if any) */}
        {(passengerName || passengerPhone) && (
          <div className="border-t border-gray-850/50 pt-2.5 space-y-2">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Passenger
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {passengerName && (
                <div className="flex items-center gap-1.5 text-gray-450">
                  <User className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="truncate font-medium">{passengerName}</span>
                </div>
              )}
              {passengerPhone && (
                <div className="flex items-center gap-1.5 text-gray-450">
                  <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="truncate font-mono">{passengerPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle & Price details */}
        {(vehicleType || price !== undefined) && (
          <div className="border-t border-gray-850/50 pt-2.5 flex items-center justify-between">
            {vehicleType && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-500 font-bold uppercase">
                  Vehicle Type
                </span>
                <VehicleBadge type={vehicleType} />
              </div>
            )}
            {price !== undefined && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] text-gray-500 font-bold uppercase">
                  Original Price
                </span>
                <span className="text-xs font-bold text-gray-450 line-through">
                  {formatPrice(price)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="bg-emerald-950/15 border border-emerald-900/10 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">Trip cancelled successfully</span>
        </div>

        <p className="text-[10px] text-gray-505 font-medium text-center bg-gray-950/20 px-1 py-2 rounded-lg border border-gray-850/50">
          This trip has been cancelled and removed from your active rides.
        </p>
      </CardContent>
    </Card>
  );
}
