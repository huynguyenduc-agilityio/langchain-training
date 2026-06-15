'use client';

import React from 'react';
import type { Trip, VehicleType } from '@/types';
import { ActiveTripsReadable } from './readables/ActiveTripsReadable';
import { UserReadable } from './readables/UserReadable';
import { RideEstimateFrontendTool } from './tools/RideEstimateFrontendTool';
import { RideConfirmFrontendTool } from './tools/RideConfirmFrontendTool';
import { DriverMatchFrontendTool } from './tools/DriverMatchFrontendTool';
import { CancelConfirmFrontendTool } from './tools/CancelConfirmFrontendTool';
import { SuccessFrontendTool } from './tools/SuccessFrontendTool';
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
      <RideConfirmFrontendTool trips={trips} setTrips={setTrips} />
      <DriverMatchFrontendTool />
      <CancelConfirmFrontendTool trips={trips} setTrips={setTrips} />
      <SuccessFrontendTool />
      <CancelErrorFrontendTool />
    </>
  );
}

export default CopilotKitTools;
