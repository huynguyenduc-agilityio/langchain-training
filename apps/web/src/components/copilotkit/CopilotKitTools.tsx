'use client';

import type { Trip, VehicleType } from '@/types';

import React from 'react';

import { ActiveTripsReadable } from './readables/ActiveTripsReadable';
import { UserReadable } from './readables/UserReadable';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelErrorFrontendTool } from './tools/CancelErrorFrontendTool';
import { CancelSuccessFrontendTool } from './tools/CancelSuccessFrontendTool';
import { InterruptFrontendTool } from './tools/InterruptFrontendTool';
import { RideEstimateFrontendTool } from './tools/RideEstimateFrontendTool';

type CopilotKitToolsProps = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  onSelectVehicle?: (vehicleType: VehicleType) => void;
};

export function CopilotKitTools({
  trips,
  setTrips,
  onSelectVehicle,
}: CopilotKitToolsProps) {
  return (
    <>
      {/* Readables */}
      <UserReadable />
      <ActiveTripsReadable trips={trips} />

      {/* Frontend Tools */}
      <RideEstimateFrontendTool onSelectVehicle={onSelectVehicle} />
      <InterruptFrontendTool trips={trips} setTrips={setTrips} />
      <DriverMatchRenderTool />
      <CancelSuccessFrontendTool />
      <CancelErrorFrontendTool />
    </>
  );
}

export default CopilotKitTools;
