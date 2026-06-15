'use client';

import React from 'react';
import {
  CheckCircle2,
  Car,
  Star,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Driver } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RideSuccessCardProps {
  tripId: string;
  pickup: string;
  destination: string;
  vehicleType: string;
  price: number;
  driver: Driver;
  etaMinutes: number;
}

function formatPrice(amount: number) {
  return '$' + amount.toFixed(2);
}

function vehicleLabel(type: string) {
  switch (type) {
    case 'bike': return '🏍️ Bike';
    case 'car4': return '🚗 Car (4-seat)';
    case 'car7': return '🚐 Car (7-seat)';
    default: return type;
  }
}

export function RideSuccessCard({
  tripId,
  pickup,
  destination,
  vehicleType,
  price,
  driver,
  etaMinutes,
}: RideSuccessCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-emerald-950/40 shadow-lg shadow-emerald-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-solid border-gray-855 bg-gradient-to-r from-emerald-950/25 to-transparent">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="font-bold text-xs text-emerald-400">
          Ride Booked Successfully!
        </span>
        <Badge
          variant="outline"
          className="ml-auto bg-emerald-950/40 text-emerald-450 border-emerald-900/30 hover:bg-emerald-950/40 text-[9px] font-bold px-2 py-0.5 rounded-lg border-solid"
        >
          #{tripId.split('-').pop()}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Route */}
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-gray-300 font-semibold truncate max-w-[100px]">{pickup}</span>
          <ArrowRight className="w-3 h-3 text-gray-550 shrink-0" />
          <span className="text-gray-300 font-semibold truncate max-w-[100px]">{destination}</span>
        </div>

        {/* Trip info */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-550 font-semibold">Vehicle</span>
          <span className="font-bold text-gray-200">{vehicleLabel(vehicleType)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-550 font-semibold">Total Fare</span>
          <span className="font-black text-emerald-400 text-sm">{formatPrice(price)}</span>
        </div>

        {/* Driver info */}
        <div className="border-t border-gray-850/50 pt-2.5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-955 border border-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-gray-150">{driver.name}</span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 bg-amber-950/30 px-1.5 py-0.5 rounded-md shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                {driver.rating}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {driver.vehicleInfo} · <span className="font-bold text-gray-200">{driver.licensePlate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-850/50 pt-2.5">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-550" />
            Driver: <strong className="text-gray-300 font-semibold">{driver.phone}</strong>
          </span>
          <span className="bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded-lg text-emerald-400 font-bold text-[10px] animate-pulse">
            Arriving in ~{etaMinutes} min
          </span>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-emerald-500/80 font-bold pt-1.5 border-t border-gray-855/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Your ride has been confirmed. Have a safe trip!</span>
        </div>
      </CardContent>
    </Card>
  );
}
