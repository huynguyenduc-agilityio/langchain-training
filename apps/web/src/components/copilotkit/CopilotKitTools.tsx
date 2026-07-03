'use client';

import type { Trip } from '@repo/shared';

import React from 'react';

import { UserReadable } from './readables/UserReadable';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelRideRenderTool } from './renderTools/CancelRideRenderTool';
import { ConfirmRideInterruptTool } from './interruptTools/ConfirmRideInterruptTool';
import { CancelTripInterruptTool } from './interruptTools/CancelTripInterruptTool';
import { TripsListRenderTool } from './renderTools/TripsListRenderTool';
import { RideEstimateRenderTool } from './renderTools/RideEstimateRenderTool';
import { ConfirmRideRenderTool } from './renderTools/ConfirmRideRenderTool';

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

      {/* Interrupt Tools */}
      <ConfirmRideInterruptTool />
      <CancelTripInterruptTool trips={trips} />
    </>
  );
}

export default CopilotKitTools;
