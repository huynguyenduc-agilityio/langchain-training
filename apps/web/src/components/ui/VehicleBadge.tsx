import type { VehicleType } from '@repo/shared';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { VEHICLE_CONFIG } from '@/constants';
import { VehicleIcon } from './VehicleIcon';

type VehicleBadgeProps = {
  type: VehicleType;
};

export function VehicleBadge({ type }: VehicleBadgeProps) {
  const config = VEHICLE_CONFIG[type] || { label: 'Unknown' };

  return (
    <Badge
      variant="outline"
      className="bg-gray-900 border-gray-850 text-gray-400 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-gray-900 text-[10px] border-solid"
    >
      <VehicleIcon type={type} className="w-3 h-3 text-gray-400 shrink-0" />
      {config.label}
    </Badge>
  );
}
