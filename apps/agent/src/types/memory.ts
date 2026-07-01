export interface UserMemory {
  passengerName?: string;
  passengerPhone?: string;
  preferredVehicle?: string;
  frequentPickups?: string[];
  frequentDestinations?: string[];
  pickupCounts?: Record<string, number>;
  destinationCounts?: Record<string, number>;
  pickupLastUsed?: Record<string, string>;
  destinationLastUsed?: Record<string, string>;
  lastUpdated?: string;
}
