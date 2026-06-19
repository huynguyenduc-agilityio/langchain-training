'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

function TripRowSkeleton() {
  return (
    <div className="p-3 flex flex-col gap-2">
      {/* Vehicle + price row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-12 rounded bg-gray-800 animate-pulse" />
          <div className="h-2.5 w-8 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-gray-800 animate-pulse" />
          <div className="h-4 w-14 rounded-full bg-gray-800 animate-pulse" />
        </div>
      </div>

      {/* Route row */}
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-gray-800 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-gray-800 animate-pulse" />
        <div className="h-2 w-2 rounded bg-gray-800 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-gray-800 animate-pulse" />
      </div>

      {/* Timestamp row */}
      <div className="flex items-center gap-1">
        <div className="h-2.5 w-2.5 rounded bg-gray-800 animate-pulse" />
        <div className="h-2 w-12 rounded bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
}

export function TripsListCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="rounded-2xl overflow-hidden my-2 border-solid bg-gray-900 border-gray-855 shadow-lg shadow-gray-950/20 max-w-sm">
      {/* Header skeleton */}
      <div className="px-4 py-2.5 bg-gray-955 border-b border-solid border-gray-855 flex items-center justify-between">
        <div className="h-2.5 w-24 rounded bg-gray-800 animate-pulse" />
        <div className="h-4 w-10 rounded-full bg-gray-800 animate-pulse" />
      </div>

      {/* Row skeletons */}
      <CardContent className="p-0 divide-y divide-solid divide-gray-850">
        {Array.from({ length: rows }).map((_, i) => (
          <TripRowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}
