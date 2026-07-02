'use client';

import type { RideConfirmCardProps } from '@/types';
import {
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  User,
  X,
} from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CARD_STATUS, VEHICLE_NAMES } from '@/constants';
import { formatPrice } from '@/utils';

export function RideConfirmCard({
  pickup,
  destination,
  distance,
  duration,
  vehicleType,
  passengerName,
  passengerPhone,
  price,
  disabled = false,
  onConfirm,
  onCancel,
  status = CARD_STATUS.PENDING,
}: RideConfirmCardProps) {
  const [loading, setLoading] = useState(false);
  const [decided, setDecided] = useState<
    typeof CARD_STATUS.CONFIRMED | typeof CARD_STATUS.CANCELLED | null
  >(null);

  const handleConfirm = () => {
    setLoading(true);
    setDecided(CARD_STATUS.CONFIRMED);
    onConfirm?.();
  };

  const handleCancel = () => {
    setDecided(CARD_STATUS.CANCELLED);
    onCancel?.();
  };

  if (status && status !== CARD_STATUS.PENDING) {
    return (
      <Card className="rounded-xl overflow-hidden my-1 bg-gray-900/30 border border-gray-850 border-solid max-w-full font-sans">
        {/* Compact Header */}
        <div className="px-3.5 py-2 flex items-center justify-between bg-gray-950/20 border-b border-gray-855/50 border-solid">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <span>📋</span>
            <span>Ride Request Details</span>
          </div>

          {/* Status Pill */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-solid flex items-center gap-1 uppercase tracking-wider ${
              status === CARD_STATUS.CONFIRMED
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                : status === CARD_STATUS.CANCELLED
                  ? 'bg-red-950/40 text-red-400 border-red-900/40'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700/50'
            }`}
          >
            {status === CARD_STATUS.CONFIRMED ? (
              <>
                <Check className="w-2.5 h-2.5" />
                <span>Confirmed</span>
              </>
            ) : status === CARD_STATUS.CANCELLED ? (
              <>
                <X className="w-2.5 h-2.5" />
                <span>Cancelled</span>
              </>
            ) : (
              <>
                <span>⏭️</span>
                <span>Bypassed</span>
              </>
            )}
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-3 text-[11px] space-y-2 text-gray-300">
          <div className="flex items-start gap-1 flex-wrap">
            <span className="font-semibold text-gray-500 shrink-0">Route:</span>
            <span className="font-bold flex items-center gap-1 leading-normal flex-wrap">
              <span>{pickup}</span>
              <ArrowRight className="w-3 h-3 text-gray-650 shrink-0" />
              <span>{destination}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400 leading-normal">
            <div>
              <span className="font-semibold text-gray-500">Name:</span>{' '}
              <span className="text-gray-200">{passengerName}</span>
            </div>
            <span className="text-gray-700 font-bold">•</span>
            <div>
              <span className="font-semibold text-gray-500">Phone:</span>{' '}
              <span className="text-gray-200">{passengerPhone}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400 leading-normal">
            <div>
              <span className="font-semibold text-gray-500">Vehicle:</span>{' '}
              <span className="text-gray-200">
                {VEHICLE_NAMES[vehicleType] || vehicleType}
              </span>
            </div>
            <span className="text-gray-700 font-bold">•</span>
            <div>
              <span className="font-semibold text-gray-500">Price:</span>{' '}
              <span className="text-emerald-400 font-bold">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

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
          icon={<MapPin className="w-3.5 h-3.5 text-gray-550" />}
          label="Route"
          value={
            <span className="flex items-center gap-1 font-bold text-gray-200">
              <span className="truncate max-w-[90px]">{pickup}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-550 shrink-0" />
              <span className="truncate max-w-[90px]">{destination}</span>
            </span>
          }
        />

        {/* Distance/Duration */}
        <DetailRow
          icon={<Navigation className="w-3.5 h-3.5 text-gray-550" />}
          label="Distance"
          value={`${distance} km`}
        />
        <DetailRow
          icon={<Clock className="w-3.5 h-3.5 text-gray-550" />}
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
            <CreditCard className="w-3.5 h-3.5 text-gray-655" />
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
              decided === CARD_STATUS.CONFIRMED
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
                : 'bg-red-950/40 text-red-400 border border-red-900/20'
            } border-solid`}
          >
            {decided === CARD_STATUS.CONFIRMED ? (
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
              disabled={disabled}
              className="flex-1 bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-450 text-white! font-semibold rounded-xl h-10 border-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Confirm
            </Button>
            <Button
              id="btn-cancel-ride"
              onClick={handleCancel}
              variant="outline"
              disabled={disabled}
              className="flex-1 bg-gray-955 border-gray-855 hover:bg-gray-855 text-gray-400 hover:text-red-400 rounded-xl h-10 border-solid flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
      <span className="font-semibold text-gray-300">{value}</span>
    </div>
  );
}
