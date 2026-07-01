'use client';

import type { Trip } from '@repo/shared';

import React from 'react';

import { UserReadable } from './readables/UserReadable';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelRideRenderTool } from './renderTools/CancelRideRenderTool';
import { InterruptFrontendTool } from './tools/InterruptFrontendTool';
import { TripsListRenderTool } from './renderTools/TripsListRenderTool';
import { RideEstimateRenderTool } from './renderTools/RideEstimateRenderTool';

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

      {/* Frontend Tools */}
      <InterruptFrontendTool trips={trips} />
    </>
  );
}

export default CopilotKitTools;
