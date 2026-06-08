'use client';

import { useCopilotReadable } from '@copilotkit/react-core';
import type { Trip } from '@/types';

interface ActiveTripsReadableProps {
  trips: Trip[];
}

export function ActiveTripsReadable({ trips }: ActiveTripsReadableProps) {
  useCopilotReadable({
    description: "The list of the user's active and past ride booking trips in Da Nang. Active trip statuses are 'searching', 'matched', 'picked_up'. Completed status is 'completed'. Cancelled status is 'cancelled'. Use this context to answer questions about the user's trip history.",
    value: trips,
  });
  return null;
}
