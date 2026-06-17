'use client';

import type { Trip } from '@/types';

import { useAgentContext } from '@copilotkit/react-core/v2';

type ActiveTripsReadableProps = {
  trips: Trip[];
};

export function ActiveTripsReadable({ trips }: ActiveTripsReadableProps) {
  const serializableTrips = trips.map((t) => ({
    id: t.id,
    userId: t.userId,
    pickup: t.pickup,
    destination: t.destination,
    distance: t.distance,
    duration: t.duration,
    vehicleType: t.vehicleType,
    passengerName: t.passengerName,
    passengerPhone: t.passengerPhone,
    price: t.price,
    status: t.status,
    createdAt: t.createdAt,
    cancelledAt: t.cancelledAt ?? null,
    cancellationFee: t.cancellationFee ?? null,
    driver: t.driver
      ? {
          name: t.driver.name,
          phone: t.driver.phone,
          vehicleInfo: t.driver.vehicleInfo,
          licensePlate: t.driver.licensePlate,
          rating: t.driver.rating,
        }
      : null,
  }));

  useAgentContext({
    description:
      "The list of the user's active and past ride booking trips in Da Nang. Active trip statuses are 'searching', 'matched', 'picked_up'. Completed status is 'completed'. Cancelled status is 'cancelled'. Use this context to answer questions about the user's trip history.",
    value: serializableTrips,
  });
  return null;
}
