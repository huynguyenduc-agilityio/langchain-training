import { Driver, Trip, VehicleType } from '@repo/shared';
import { RetrievedDocument } from './index';

export type ToolTerminalBehavior = 'always' | 'success';

export interface UiTerminalToolConfig {
  endOn: ToolTerminalBehavior;
}

export interface RequestRideResult {
  success: boolean;
  tripDraft: {
    pickup: string;
    destination: string;
    distance: number;
    duration: number;
    vehicleType: VehicleType;
    passengerName: string;
    passengerPhone: string;
    price: number;
    status: string;
  };
}

export interface MatchDriverResult {
  success: boolean;
  tripId: string;
  status?: 'matched';
  driver?: Driver | null;
  etaMinutes?: number;
  error?: string;
  message?: string;
}

export interface CancelTripResult {
  success: boolean;
  needs_confirm?: boolean;
  is_selection?: boolean;
  tripId?: string;
  pickup?: string;
  destination?: string;
  driverName?: string | null;
  trips?: Trip[];
  error?: string;
  reason?: string;
}

export interface LookupTripsResult {
  success: boolean;
  passengerPhone: string;
  trips: Trip[];
  limit: number;
  message: string;
}

export interface RetrieveKnowledgeResult {
  documents: RetrievedDocument[];
  query: string;
  totalResults: number;
}
