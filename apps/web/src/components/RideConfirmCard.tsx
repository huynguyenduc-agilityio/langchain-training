'use client';

import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Clock,
  User,
  Phone,
  CreditCard,
  Check,
  X,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { VehicleType } from '@/types';

interface RideConfirmCardProps {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  vehicleType: VehicleType;
  passengerName: string;
  passengerPhone: string;
  price: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const VEHICLE_NAMES: Record<VehicleType, string> = {
  bike: 'Bike',
  car4: 'Car (4-seat)',
  car7: 'Car (7-seat)',
};

function formatPrice(amount: number) {
  return '$' + amount.toFixed(2);
}

export function RideConfirmCard({
  pickup,
  destination,
  distance,
  duration,
  vehicleType,
  passengerName,
  passengerPhone,
  price,
  onConfirm,
  onCancel,
}: RideConfirmCardProps) {
  const [loading, setLoading] = useState(false);
  const [decided, setDecided] = useState<'confirmed' | 'cancelled' | null>(null);

  const handleConfirm = () => {
    setLoading(true);
    setDecided('confirmed');
    onConfirm?.();
  };

  const handleCancel = () => {
    setDecided('cancelled');
    onCancel?.();
  };

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-emerald-950/40 shadow-lg shadow-emerald-950/5">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-emerald-950/20 to-transparent border-b border-gray-855 border-solid">
        <div className="w-7 h-7 rounded-lg bg-emerald-950/50 border border-emerald-900/30 flex items-center justify-center text-xs shrink-0 border-solid">
          📋
        </div>
        <span className="font-bold text-xs text-emerald-400">
          Confirm Ride Request
        </span>
      </div>

      {/* Details */}
      <CardContent className="p-4 space-y-3">
        {/* Route */}
        <DetailRow
          icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
          label="Route"
          value={
            <span className="flex items-center gap-1 font-bold text-gray-200">
              <span className="truncate max-w-[90px]">{pickup}</span>
              <ArrowRight className="w-3 h-3 text-gray-550 shrink-0" />
              <span className="truncate max-w-[90px]">{destination}</span>
            </span>
          }
        />

        {/* Distance/Duration */}
        <DetailRow
          icon={<Navigation className="w-3.5 h-3.5 text-gray-500" />}
          label="Distance"
          value={`${distance} km`}
        />
        <DetailRow
          icon={<Clock className="w-3.5 h-3.5 text-gray-500" />}
          label="Duration"
          value={`~${duration} min`}
        />

        {/* Vehicle */}
        <DetailRow
          icon={<span className="text-xs">🚗</span>}
          label="Vehicle"
          value={VEHICLE_NAMES[vehicleType] || vehicleType}
        />

        {/* Passenger */}
        <DetailRow
          icon={<User className="w-3.5 h-3.5 text-gray-550" />}
          label="Passenger"
          value={passengerName}
        />
        <DetailRow
          icon={<Phone className="w-3.5 h-3.5 text-gray-550" />}
          label="Phone"
          value={passengerPhone}
        />

        <Separator className="bg-gray-855 my-1" />

        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1.5 text-xs text-gray-550 font-semibold">
            <CreditCard className="w-3.5 h-3.5 text-gray-605" />
            Total Price
          </span>
          <span className="font-extrabold text-base text-emerald-400">
            {formatPrice(price)}
          </span>
        </div>
      </CardContent>

      <Separator className="bg-gray-850" />

      {/* Actions */}
      <div className="p-3 flex gap-2">
        {decided ? (
          <div
            className={`w-full text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              decided === 'confirmed'
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
                : 'bg-red-950/40 text-red-400 border border-red-900/20'
            } border-solid`}
          >
            {decided === 'confirmed' ? (
              <>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                {loading ? 'Submitting ride request...' : 'Ride confirmed'}
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-400" />
                Request cancelled
              </>
            )}
          </div>
        ) : (
          <>
            <Button
              id="btn-confirm-ride"
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-450 text-white! font-semibold rounded-xl h-10 border-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/10"
            >
              <Check className="w-4 h-4" />
              Confirm
            </Button>
            <Button
              id="btn-cancel-ride"
              onClick={handleCancel}
              variant="outline"
              className="flex-1 bg-gray-955 border-gray-855 hover:bg-gray-855 text-gray-400 hover:text-red-400 rounded-xl h-10 border-solid flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

/* ── Detail Row ── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-gray-300">
        {value}
      </span>
    </div>
  );
}
