'use client';

import type { TripCardProps } from '@/types';
import { ArrowRight, MapPin, Navigation, Phone, User } from 'lucide-react';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TripStatusBadge, VehicleBadge } from '@/components/ui/index';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils';

import { TripDetailDialog } from './TripDetailDialog';

export function TripCard({ trip, index: _index, onCancel }: TripCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isCancellable =
    trip.status === 'searching' || trip.status === 'matched';

  return (
    <>
      <Card
        onClick={() => setDetailOpen(true)}
        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border bg-gray-900/60 hover:bg-gray-900 border-solid ${
          isCancellable
            ? 'border-emerald-950/40 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-950/20'
            : 'border-gray-850 hover:border-gray-700/60 hover:shadow-sm'
        }`}
      >
        <CardContent className="p-4 space-y-3">
          {/* Top row: Route & Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-xs text-gray-250 truncate max-w-[110px]">
                {trip.pickup}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-650 shrink-0" />
              <span className="font-bold text-xs text-gray-250 truncate max-w-[110px]">
                {trip.destination}
              </span>
            </div>
            <TripStatusBadge status={trip.status} />
          </div>

          <Separator className="bg-gray-850" />

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-gray-500 shrink-0" />
              <span className="text-[10px] font-semibold text-gray-400">
                {trip.distance} km · {trip.duration} min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-gray-500 shrink-0" />
              <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[110px]">
                {trip.passengerName}
              </span>
            </div>
            {trip.driver ? (
              <div className="flex items-center gap-1.5 col-span-2 text-emerald-400/80 bg-emerald-950/20 border border-emerald-900/10 px-2 py-1 rounded-lg">
                <span className="text-[9px] font-bold">Driver:</span>
                <span className="text-[10px] font-bold text-gray-200">
                  {trip.driver.name} ({trip.driver.licensePlate})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="text-[10px] font-semibold text-gray-400">
                  {trip.passengerPhone}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-850" />

          {/* Bottom row: Vehicle, ID & Price */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <VehicleBadge type={trip.vehicleType} />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                #{trip.id.split('-').pop()}
              </span>
            </div>
            <span className="font-extrabold text-xs text-emerald-400">
              {formatPrice(trip.price)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <TripDetailDialog
        trip={trip}
        isOpen={detailOpen}
        onOpenChange={setDetailOpen}
        onCancel={onCancel}
      />
    </>
  );
}
