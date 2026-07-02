import React from 'react';
import { Car, Motorbike } from 'lucide-react';

import type { VehicleType } from '@repo/shared';

type VehicleIconProps = {
  type: VehicleType;
  className?: string;
};

export function VehicleIcon({ type, className }: VehicleIconProps) {
  switch (type) {
    case 'bike':
      return <Motorbike className={className} />;
    case 'car4':
    case 'car7':
      return <Car className={className} />;
    default:
      return <Car className={className} />;
  }
}
