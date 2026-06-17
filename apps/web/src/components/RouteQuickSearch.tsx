'use client';

import type { RouteQuickSearchProps } from '@/types';
import { Compass, MapPin, Search } from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RouteQuickSearch({ onEstimate }: RouteQuickSearchProps) {
  const [pickup, setPickup] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination) return;
    if (onEstimate) {
      onEstimate(pickup, destination);
    }
  };

  return (
    <Card className="p-4 bg-gray-900 border-gray-800 rounded-2xl shadow-lg shadow-black/20 animate-fade-in mb-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 items-end"
      >
        {/* Pickup Input */}
        <div className="w-full md:flex-1 space-y-1.5">
          <label
            htmlFor="pickup-input"
            className="text-xs font-semibold text-gray-400 flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Pickup Location
          </label>
          <Input
            id="pickup-input"
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter pickup address (e.g. Dragon Bridge)"
            className="w-full bg-gray-950 border-gray-800 text-gray-205 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 h-10 border-solid"
          />
        </div>

        {/* Destination Input */}
        <div className="w-full md:flex-1 space-y-1.5">
          <label
            htmlFor="destination-input"
            className="text-xs font-semibold text-gray-400 flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Destination
          </label>
          <Input
            id="destination-input"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination (e.g. Da Nang Bus Station)"
            className="w-full bg-gray-950 border-gray-800 text-gray-255 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 h-10 border-solid"
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          disabled={!pickup || !destination}
          className="w-full md:w-auto h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold px-6 rounded-xl flex items-center justify-center gap-2 transition-all border-0 shadow-md shadow-emerald-900/10 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Estimate Fare
        </Button>
      </form>
    </Card>
  );
}
