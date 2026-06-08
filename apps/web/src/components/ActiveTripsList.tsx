'use client';

import React from 'react';
import { Car, MapPin, ArrowRight, Clock, Navigation } from 'lucide-react';
import type { Trip } from '@/types';
import { TripStatusBadge } from '@/components/ui/index';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ActiveTripsListProps {
  trips: Trip[];
}

function formatTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function ActiveTripsList({ trips }: ActiveTripsListProps) {
  const activeTrips = trips.filter(
    (t) => t.status === 'searching' || t.status === 'matched' || t.status === 'picked_up'
  );

  if (activeTrips.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-850 rounded-xl my-2 border-solid">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-gray-500 font-semibold">No active trips at the moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-850 rounded-xl overflow-hidden my-2 border-solid shadow-md shadow-black/10">
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-850 border-solid bg-gray-900/60">
        <Car className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-bold text-gray-200">
          Active Trips ({activeTrips.length})
        </span>
      </div>

      <ScrollArea className="max-h-60">
        <div className="flex flex-col">
          {activeTrips.map((trip, idx) => (
            <React.Fragment key={trip.id}>
              {idx > 0 && <Separator className="bg-gray-850" />}
              <div className="px-4 py-2.5 hover:bg-gray-850/30 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-200 min-w-0 flex-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[80px]">{trip.pickup}</span>
                    <ArrowRight className="w-3 h-3 text-gray-550 shrink-0" />
                    <span className="truncate max-w-[80px]">{trip.destination}</span>
                  </span>
                  <TripStatusBadge status={trip.status} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                    <Navigation className="w-3.5 h-3.5 text-gray-650" />
                    {trip.distance} km
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-gray-650" />
                    Requested at: {formatTime(trip.createdAt)}
                  </span>
                  <span className="text-[10px] font-mono text-gray-655 ml-auto">
                    #{trip.id.split('-').pop()}
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
