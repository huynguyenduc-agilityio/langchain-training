'use client';

import type { Trip } from '@repo/shared';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TripStatusBadge, VehicleBadge } from '@/components/ui/index';
import { formatPrice, formatRelativeTime } from '@/utils';

export function TripsListCard({ trips }: { trips: Trip[] }) {
  // DB layer already limits to 5 most recent — render all returned trips
  const tripsToDisplay = trips;

  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-gray-855 shadow-lg shadow-gray-950/20 max-w-sm">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gray-955 border-b border-solid border-gray-855 flex items-center justify-between">
        <span className="font-extrabold text-xs text-gray-200 uppercase tracking-wider">
          Recent Trips
        </span>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-solid border-emerald-900/40">
          {tripsToDisplay.length} trips
        </span>
      </div>

      <CardContent className="p-0 divide-y divide-solid divide-gray-850">
        {tripsToDisplay.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">
              No trips found.
            </p>
          </div>
        ) : (
          tripsToDisplay.map((trip) => {
            const shortId = trip.id.split('-').pop();
            return (
              <div
                key={trip.id}
                className="p-3 hover:bg-gray-855/30 transition-colors duration-200 flex flex-col gap-2"
              >
                {/* Status and Vehicle and Price */}
                <div className="flex items-center justify-between">
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

                {/* Route: pickup to destination (highly compact) */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span title={trip.pickup} className="truncate max-w-[120px]">{trip.pickup}</span>
                  <ArrowRight className="w-3 h-3 text-gray-650 shrink-0" />
                  <span title={trip.destination} className="truncate max-w-[120px]">
                    {trip.destination}
                  </span>
                </div>

                {/* Timestamp */}
                {trip.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600 shrink-0" />
                    <span className="text-[10px] text-gray-550 font-medium">
                      {formatRelativeTime(trip.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
