'use client';

import React from 'react';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { DriverMatchCard } from '@/components/DriverMatchCard';
import { DriverMatchErrorCard } from '@/components/DriverMatchErrorCard';

export function DriverMatchFrontendTool() {
  useFrontendTool({
    name: 'showDriverMatch',
    description: 'Display details of the matched driver to the user, including ETA, rating, vehicle, license plate.',
    parameters: z.object({
      tripId: z.string().describe('The trip ID'),
      driver: z.object({
        name: z.string(),
        phone: z.string(),
        vehicleInfo: z.string(),
        licensePlate: z.string(),
        rating: z.number(),
      }).describe('Driver details'),
      etaMinutes: z.number().describe('Estimated arrival time in minutes'),
    }),
    handler: async (args) => {
      return 'Displayed driver match card';
    },
    render: ({ args }) => {
      if (!args.driver) return null;
      return (
        <DriverMatchCard
          tripId={args.tripId || ''}
          driver={args.driver}
          etaMinutes={args.etaMinutes || 3}
        />
      );
    },
  });

  useFrontendTool({
    name: 'showDriverMatchError',
    description: 'Display a card indicating that no driver was matched, with options to retry or cancel.',
    parameters: z.object({
      tripId: z.string().describe('The trip ID'),
      reason: z.string().describe('The reason for matching failure (e.g. no drivers available)'),
    }),
    handler: async (args) => {
      return 'Displayed driver match error card';
    },
    render: ({ args }) => {
      return (
        <DriverMatchErrorCard
          tripId={args.tripId || ''}
          reason={args.reason || ''}
        />
      );
    },
  });

  return null;
}
