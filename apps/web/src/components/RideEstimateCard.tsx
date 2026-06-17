'use client';

import type { RideEstimateCardProps } from '@/types';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
} from 'lucide-react';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VEHICLE_EMOJIS, VEHICLE_NAMES } from '@/constants';
import { formatPrice } from '@/utils';

export function RideEstimateCard({
  pickup,
  destination,
  distance,
  duration,
  options,
  onSelectVehicle,
}: RideEstimateCardProps) {
  if (!options || options.length === 0) {
    return (
      <Card className="border-red-500/20 bg-gray-950 p-4 my-2 border-solid shadow-md shadow-red-950/5">
        <div className="flex items-center gap-2 mb-1.5">
          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-sm font-bold text-gray-205">
            Unable to estimate this ride
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-normal">
          Please check your pickup and destination locations.
        </p>
      </Card>
    );
  }

  return (
    <div className="my-2 space-y-2.5">
      {/* Route & Distance header */}
      <div className="flex flex-col gap-1.5 px-3 py-2 bg-emerald-950/20 border border-emerald-900/30 rounded-xl border-solid">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-400 truncate max-w-[100px]">
            {pickup}
          </span>
          <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-400 truncate max-w-[100px]">
            {destination}
          </span>
          <Badge className="ml-auto bg-emerald-950 text-emerald-400 border border-emerald-850 hover:bg-emerald-950/80 text-[10px] px-2 py-0.5 rounded-full border-solid">
            {options.length} vehicle{options.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold px-5">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-500" />
            {distance} km
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" />~{duration} min travel
            time
          </span>
        </div>
      </div>

      {/* Vehicle Option cards */}
      {options.map((opt) => (
        <Card
          key={opt.vehicleType}
          className="group rounded-2xl overflow-hidden cursor-pointer bg-gray-900 border-gray-855 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-950/20 transition-all duration-300 border-solid"
          onClick={() => onSelectVehicle?.(opt.vehicleType)}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Vehicle icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-955 border border-gray-855 flex items-center justify-center text-lg shrink-0 border-solid">
                {VEHICLE_EMOJIS[opt.vehicleType] || '🚗'}
              </div>

              {/* Vehicle type & details */}
              <div className="min-w-0">
                <span className="font-bold text-xs text-gray-100 block truncate">
                  {VEHICLE_NAMES[opt.vehicleType]}
                </span>
                <span className="text-[10px] text-gray-550 font-semibold block mt-0.5">
                  Intra-city ride in Da Nang
                </span>
              </div>
            </div>

            {/* Price & Select action */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-extrabold text-sm text-emerald-400">
                {formatPrice(opt.price)}
              </span>
              <div className="flex items-center gap-0.5 text-emerald-400 font-bold text-xs">
                <span>Select</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
