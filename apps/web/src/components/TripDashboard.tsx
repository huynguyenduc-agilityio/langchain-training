'use client';

import type { TripDashboardProps } from '@/types';
import { ArrowUpDown, Car, RefreshCw, TicketPlus } from 'lucide-react';

import React, { useState } from 'react';
import { TripCard } from '@/components/TripCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { RouteQuickSearch } from './RouteQuickSearch';

export function TripDashboard({
  trips,
  onCancelTrip,
  onEstimateRide,
  onRefresh,
}: TripDashboardProps) {
  const [filter, setFilter] = useState<
    'all' | 'active' | 'completed' | 'cancelled'
  >('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Stats calculation
  const activeCount = trips.filter(
    (t) =>
      t.status === 'searching' ||
      t.status === 'matched' ||
      t.status === 'picked_up',
  ).length;
  const completedCount = trips.filter((t) => t.status === 'completed').length;
  const cancelledCount = trips.filter((t) => t.status === 'cancelled').length;

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    if (filter === 'all') return true;
    if (filter === 'active')
      return (
        trip.status === 'searching' ||
        trip.status === 'matched' ||
        trip.status === 'picked_up'
      );
    if (filter === 'completed') return trip.status === 'completed';
    if (filter === 'cancelled') return trip.status === 'cancelled';
    return true;
  });

  // Sort trips
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    if (sortBy === 'date-desc') {
      return timeB - timeA;
    }
    if (sortBy === 'date-asc') {
      return timeA - timeB;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  return (
    <div className="flex flex-col bg-background text-gray-100 min-h-[calc(100vh-64px)]">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 px-6 pt-6 pb-4 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Trip Dashboard
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {trips.length > 0
                ? `${activeCount} active · ${completedCount} completed · ${cancelledCount} cancelled`
                : 'No trips yet'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-emerald-400 h-9 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer border-solid"
              onClick={() => {
                if (onRefresh) onRefresh();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-450 text-white! font-semibold h-9 px-4 rounded-xl flex items-center gap-1.5 transition-all text-xs shadow-md shadow-emerald-900/10 border-0 cursor-pointer"
              onClick={() => {
                if (onEstimateRide)
                  onEstimateRide('Dragon Bridge', 'Da Nang Bus Station');
              }}
            >
              <TicketPlus className="w-3.5 h-3.5" />
              New Ride
            </Button>
          </div>
        </div>

        {/* Route Quick Search Panel */}
        <RouteQuickSearch onEstimate={onEstimateRide} />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <StatCard
          label="Total Trips"
          value={trips.length}
          color="text-emerald-400"
        />
        <StatCard label="Active" value={activeCount} color="text-amber-400" />
        <StatCard
          label="Completed"
          value={completedCount}
          color="text-teal-400"
        />
        <StatCard
          label="Cancelled"
          value={cancelledCount}
          color="text-red-400"
        />
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-y border-gray-900 bg-gray-950/50">
        <Tabs
          value={filter}
          onValueChange={(val) =>
            setFilter(val as 'all' | 'active' | 'completed' | 'cancelled')
          }
          className="w-auto"
        >
          <TabsList className="bg-gray-900 border border-gray-800 p-0.5 rounded-xl h-9 border-solid">
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 focus-visible:ring-0 cursor-pointer"
            >
              All ({trips.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 focus-visible:ring-0 cursor-pointer"
            >
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 focus-visible:ring-0 cursor-pointer"
            >
              Completed ({completedCount})
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 focus-visible:ring-0 cursor-pointer"
            >
              Cancelled ({cancelledCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-800 text-gray-300 text-xs rounded-xl focus:ring-emerald-500 h-9 border-solid">
              <SelectValue placeholder="Select sort order" />
            </SelectTrigger>
            <SelectContent className="bg-gray-950 border-gray-800 text-gray-250">
              <SelectItem
                value="date-desc"
                className="focus:bg-emerald-950/20 focus:text-emerald-400 text-gray-350 text-xs cursor-pointer"
              >
                Newest first
              </SelectItem>
              <SelectItem
                value="date-asc"
                className="focus:bg-emerald-950/20 focus:text-emerald-400 text-gray-350 text-xs cursor-pointer"
              >
                Oldest first
              </SelectItem>
              <SelectItem
                value="price-desc"
                className="focus:bg-emerald-950/20 focus:text-emerald-400 text-gray-350 text-xs cursor-pointer"
              >
                Price high to low
              </SelectItem>
              <SelectItem
                value="price-asc"
                className="focus:bg-emerald-950/20 focus:text-emerald-400 text-gray-350 text-xs cursor-pointer"
              >
                Price low to high
              </SelectItem>
              <SelectItem
                value="status"
                className="focus:bg-emerald-950/20 focus:text-emerald-400 text-gray-350 text-xs cursor-pointer"
              >
                By status
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trip List Container */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4 pb-8">
          {sortedTrips.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            sortedTrips.map((trip, index) => (
              <div
                key={trip.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TripCard trip={trip} index={index} onCancel={onCancelTrip} />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="bg-gray-900 border-gray-800 rounded-2xl shadow-sm transition-all hover:border-gray-700/60 duration-300 border-solid">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
          {label}
        </p>
        <p className={`text-2xl font-extrabold mt-2 ${color} tracking-tight`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Empty State ── */
function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/30 flex items-center justify-center mb-4 border border-emerald-800/10 shadow-inner border-solid">
        <Car className="w-7 h-7 text-emerald-400" />
      </div>
      <h3 className="text-base font-bold text-gray-200 mb-1">No trips found</h3>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        {filter === 'all'
          ? 'Use the AI assistant on the right sidebar to estimate fares and book rides!'
          : filter === 'active'
            ? 'You have no active trips at the moment.'
            : filter === 'completed'
              ? "You haven't completed any trips yet."
              : "You haven't cancelled any trips."}
      </p>
    </div>
  );
}
