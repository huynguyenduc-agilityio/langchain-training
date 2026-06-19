'use client';

import type { Trip } from '@/types';

import React from 'react';

import { ActiveTripsReadable } from './readables/ActiveTripsReadable';
import { UserReadable } from './readables/UserReadable';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelErrorFrontendTool } from './tools/CancelErrorFrontendTool';
import { CancelSuccessFrontendTool } from './tools/CancelSuccessFrontendTool';
import { InterruptFrontendTool } from './tools/InterruptFrontendTool';
import { TripsListRenderTool } from './renderTools/TripsListRenderTool';
import { RideEstimateFrontendTool } from './tools/RideEstimateFrontendTool';

type CopilotKitToolsProps = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

export function CopilotKitTools({ trips, setTrips }: CopilotKitToolsProps) {
  return (
    <>
      {/* Readables */}
      <UserReadable />
      <ActiveTripsReadable trips={trips} />

      {/* Frontend Tools */}
      <RideEstimateFrontendTool />
      <InterruptFrontendTool trips={trips} setTrips={setTrips} />
      <DriverMatchRenderTool />
      <CancelSuccessFrontendTool />
      <CancelErrorFrontendTool />
      <TripsListRenderTool />
    </>
  );
}

export default CopilotKitTools;
