'use client';

import React from 'react';
import type { Trip, VehicleType } from '@/types';
import { ActiveTripsReadable } from './readables/ActiveTripsReadable';
import { UserReadable } from './readables/UserReadable';
import { RideEstimateFrontendTool } from './tools/RideEstimateFrontendTool';
import { InterruptFrontendTool } from './tools/InterruptFrontendTool';
import { DriverMatchRenderTool } from './renderTools/DriverMatchRenderTool';
import { CancelSuccessFrontendTool } from './tools/CancelSuccessFrontendTool';
import { CancelErrorFrontendTool } from './tools/CancelErrorFrontendTool';

interface CopilotKitToolsProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  onSelectVehicle?: (vehicleType: VehicleType) => void;
}

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
