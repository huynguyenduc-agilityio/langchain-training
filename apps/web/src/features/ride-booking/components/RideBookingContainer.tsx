'use client';

import React, { useEffect } from 'react';
import { TripDashboard } from '@/components/TripDashboard';
import type { Trip } from '@/types';
import { http } from '@/lib/http';

interface RideBookingContainerProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function RideBookingContainer({
  trips,
  setTrips,
}: RideBookingContainerProps) {
  const fetchTrips = () => {
    http<{ success: boolean; trips: Trip[] }>('/api/trips')
      .then((data) => {
        if (data.success && data.trips) {
          setTrips(data.trips);
        }
      })
      .catch((err) => console.error('Error fetching trips:', err));
  };

  // Fetch on mount and set up polling every 3 seconds to sync with Supabase / Agent
  // useEffect(() => {
  //   fetchTrips();
  //   const interval = setInterval(fetchTrips, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  const handleCancelTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    const cancellationFee = trip?.driver ? 1.0 : 0;
    const cancelledAt = new Date().toISOString();

    http<{ success: boolean }>('/api/trips', {
      method: 'PATCH',
      body: JSON.stringify({
        tripId,
        updates: {
          status: 'cancelled',
          cancellationFee,
          cancelledAt,
        },
      }),
    })
      .then((data) => {
        if (data.success) {
          setTrips((prev) =>
            prev.map((t) =>
              t.id === tripId
                ? {
                    ...t,
                    status: 'cancelled',
                    cancelledAt,
                    cancellationFee,
                  }
                : t,
            ),
          );
        }
      })
      .catch((err) => console.error('Error cancelling trip:', err));
  };

  const handleEstimateRide = (pickup: string, destination: string) => {
    if (!pickup || !destination) return;
    const query = `Estimate a ride from ${pickup} to ${destination}`;

    // Copy the query message to the clipboard to assist the user in sending it easily
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(query);
    }
  };

  return (
    <TripDashboard
      trips={trips}
      onCancelTrip={handleCancelTrip}
      onEstimateRide={handleEstimateRide}
      onRefresh={fetchTrips}
    />
  );
}
