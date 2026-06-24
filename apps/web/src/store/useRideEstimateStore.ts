import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VehicleType } from '@repo/shared';

type RideEstimateState = {
  selections: Record<string, VehicleType>;
  setSelection: (toolCallId: string, vehicleType: VehicleType) => void;
};

export const useRideEstimateStore = create<RideEstimateState>()(
  persist(
    (set) => ({
      selections: {},
      setSelection: (toolCallId, vehicleType) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [toolCallId]: vehicleType,
          },
        })),
    }),
    {
      name: 'ride-estimate-store',
    },
  ),
);
