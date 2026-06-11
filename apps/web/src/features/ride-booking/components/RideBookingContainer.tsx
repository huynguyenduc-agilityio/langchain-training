'use client';

import React, { useEffect } from 'react';
import { TripDashboard } from '@/components/TripDashboard';
import type { Trip } from '@/types';
import { http } from '@/lib/http';
import { API_ROUTES } from '@/constants';
import { useAuth } from '@/features/auth/auth-context';

interface RideBookingContainerProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export function RideBookingContainer({
  trips,
  setTrips,
}: RideBookingContainerProps) {
  const { user } = useAuth();

  const fetchTrips = () => {
    if (!user?.uid) return;
    http<{ success: boolean; trips: Trip[] }>(
      `${API_ROUTES.TRIPS}?userId=${user.uid}`,
    )
      .then((data) => {
        if (data.success && data.trips) {
          setTrips(data.trips);
        }
      })
      .catch((err) => console.error('Error fetching trips:', err));
  };

  // Fetch on mount/user change and subscribe to real-time events via Server-Sent Events (SSE)
  useEffect(() => {
    if (!user?.uid) return;

    fetchTrips();

    const eventSource = new EventSource(API_ROUTES.TRIPS_STREAM);

    eventSource.onmessage = (event) => {
      if (event.data === 'connected') {
        return;
      }
      // When any database update occurs, refresh the trips list
      fetchTrips();
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error, reconnecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [user?.uid]);

  const handleCancelTrip = (tripId: string) => {
    if (!user?.uid) return;
    const trip = trips.find((t) => t.id === tripId);
    const cancellationFee = trip?.driver ? 1.0 : 0;
    const cancelledAt = new Date().toISOString();

    http<{ success: boolean }>(API_ROUTES.TRIPS, {
      method: 'PATCH',
      body: JSON.stringify({
        tripId,
        userId: user.uid,
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
