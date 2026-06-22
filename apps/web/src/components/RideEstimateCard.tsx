'use client';

import React, { useState, useEffect } from 'react';
import type { RideEstimateCardProps, VehicleType } from '@/types';
import { ArrowRight, Check, Clock, MapPin, Navigation } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VEHICLE_EMOJIS, VEHICLE_NAMES } from '@/constants';
import { cn, formatPrice } from '@/utils';
import { useRideEstimateStore } from '@/store/useRideEstimateStore';

export function RideEstimateCard({
  toolCallId,
  pickup,
  destination,
  distance,
  duration,
  options,
  onSelectVehicle,
}: RideEstimateCardProps) {
  const cardKey = toolCallId || `${pickup}-${destination}-${distance}-${duration}`;
  const selection = useRideEstimateStore((state) => state.selections[cardKey]);
  const setSelection = useRideEstimateStore((state) => state.setSelection);

  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

  // Sync selection from Zustand store after mounting to prevent hydration mismatches
  useEffect(() => {
    if (selection) {
      setSelectedType(selection);
    }
  }, [selection]);

  const handleSelect = (vehicleType: VehicleType) => {
    if (selectedType) return; // Ignore if already selected
    setSelectedType(vehicleType);
    setSelection(cardKey, vehicleType);
    onSelectVehicle?.(vehicleType);
  };

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
      {options.map((opt, index) => {
        const isSelected = selectedType === opt.vehicleType;
        const isAnySelected = selectedType !== null;

        return (
          <Card
            key={index}
            className={cn(
              'group rounded-2xl overflow-hidden bg-gray-900 border-gray-855 transition-all duration-300 border-solid',
              isAnySelected
                ? isSelected
                  ? 'border-emerald-500 shadow-md shadow-emerald-950/20'
                  : ''
                : 'cursor-pointer hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-950/20',
            )}
            style={{
              opacity: isAnySelected && !isSelected ? 0.4 : 1,
              pointerEvents: isAnySelected ? 'none' : 'auto',
            }}
            onClick={() => handleSelect(opt.vehicleType)}
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
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-extrabold text-sm text-emerald-400">
                  {formatPrice(opt.price)}
                </span>
                {/* Selection Icon */}
                <div className="shrink-0 flex items-center justify-center">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-gray-950 transition-all duration-300 shadow-sm shadow-emerald-500/20">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-solid border-gray-600 flex items-center justify-center group-hover:border-emerald-500 transition-all duration-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-emerald-500/30 transition-all duration-200" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
