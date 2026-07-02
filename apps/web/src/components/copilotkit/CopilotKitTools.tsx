'use client';

import type { Trip } from '@repo/shared';

import React from 'react';

import { UserReadable } from './readables/UserReadable';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelRideRenderTool } from './renderTools/CancelRideRenderTool';
import { ConfirmRideInterrupt } from './interrupts/ConfirmRideInterrupt';
import { CancelTripInterrupt } from './interrupts/CancelTripInterrupt';
import { TripsListRenderTool } from './renderTools/TripsListRenderTool';
import { RideEstimateRenderTool } from './renderTools/RideEstimateRenderTool';
import { ConfirmRideRenderTool } from './renderTools/ConfirmRideRenderTool';
import { CancelTripRenderTool } from './renderTools/CancelTripRenderTool';

type CopilotKitToolsProps = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

export function CopilotKitTools({ trips, setTrips }: CopilotKitToolsProps) {
  return (
    <>
      {/* Readables */}
      <UserReadable />

      {/* Render Tools */}
      <RideEstimateRenderTool />
      <DriverMatchRenderTool setTrips={setTrips} />
      <CancelRideRenderTool />
      <TripsListRenderTool />
      <ConfirmRideRenderTool />
      <CancelTripRenderTool trips={trips} />

      {/* Interrupt Tools */}
      <ConfirmRideInterrupt />
      <CancelTripInterrupt trips={trips} />
    </>
  );
}

export default CopilotKitTools;
