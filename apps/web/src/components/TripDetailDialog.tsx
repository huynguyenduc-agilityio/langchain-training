'use client';

import type { TripDetailDialogProps } from '@/types';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  Compass,
  FileText,
  MapPin,
  Phone,
  Star,
  User,
  X,
} from 'lucide-react';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TripStatusBadge, VehicleBadge } from '@/components/ui/index';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatPrice, formatTime } from '@/utils';

export function TripDetailDialog({
  trip,
  isOpen,
  onOpenChange,
  onCancel,
}: TripDetailDialogProps) {
  const isCancellable =
    trip.status === 'searching' || trip.status === 'matched';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md! max-h-[85vh] overflow-y-auto bg-gray-950 border border-gray-800 text-gray-100 rounded-2xl shadow-xl p-6 shadow-black/80"
      >
        <DialogHeader className="space-y-1">
          {/* Row 1: Trip ID + Close button */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" />
              Trip Details #{trip.id}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Row 2: Title + Status badge */}
          <div className="flex items-center justify-between pt-1">
            <DialogTitle className="text-lg font-bold text-gray-100">
              City Ride
            </DialogTitle>
            <TripStatusBadge status={trip.status} />
          </div>
          <DialogDescription className="text-xs text-gray-400">
            Requested at{' '}
            {trip.createdAt
              ? `${formatTime(trip.createdAt)} - ${formatDate(trip.createdAt)}`
              : 'Just now'}
          </DialogDescription>
        </DialogHeader>

        {/* Route Details */}
        <div className="bg-gray-900/60 border border-gray-850 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  Pickup
                </span>
                <span className="text-xs font-bold text-gray-200 truncate max-w-[140px]">
                  {trip.pickup}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-650 shrink-0" />
            <div className="flex items-center gap-2 text-right">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  Destination
                </span>
                <span className="text-xs font-bold text-gray-200 truncate max-w-[140px]">
                  {trip.destination}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-850/50" />

          {/* Distance & Duration Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Distance
              </div>
              <div className="text-xs font-semibold text-gray-200">
                {trip.distance} km
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Estimated Duration
              </div>
              <div className="text-xs font-semibold text-gray-200">
                {trip.duration} min
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info (if matched, picked_up, or completed) */}
        {trip.driver && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Driver Information
            </h4>
            <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-200">
                      {trip.driver.name}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 bg-amber-950/30 px-1.5 py-0.5 rounded-md">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      {trip.driver.rating}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {trip.driver.vehicleInfo} ·{' '}
                    <span className="font-semibold text-gray-300">
                      {trip.driver.licensePlate}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-650" />
                    {trip.driver.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passenger Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Passenger Information
          </h4>
          <div className="grid grid-cols-2 gap-3 bg-gray-900/40 border border-gray-850 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase">Name</span>
                <span className="text-xs font-semibold text-gray-200">
                  {trip.passengerName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase">
                  Phone
                </span>
                <span className="text-xs font-semibold text-gray-200">
                  {trip.passengerPhone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Price Info */}
        <div className="flex items-center justify-between mt-4 bg-gray-900/60 border border-gray-850 rounded-xl p-3">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-gray-500 uppercase font-bold">
              Vehicle Type
            </span>
            <div className="flex items-center gap-1.5">
              <VehicleBadge type={trip.vehicleType} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] text-gray-500 uppercase font-bold">
              Total Price
            </span>
            <span className="text-base font-black text-emerald-400">
              {formatPrice(trip.price)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-6">
          <Button
            variant="outline"
            className="flex-1 bg-gray-900 border-gray-855 hover:bg-gray-850 text-gray-300 text-xs font-semibold rounded-xl h-11 border-solid cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {isCancellable && onCancel && (
            <Button
              className="flex-1 bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 text-red-400 text-xs font-semibold rounded-xl h-11 border-solid cursor-pointer animate-fade-in"
              onClick={() => {
                onCancel(trip.id);
                onOpenChange(false);
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Cancel Trip
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
