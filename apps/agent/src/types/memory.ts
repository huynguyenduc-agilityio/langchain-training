export interface UserMemory {
  passengerName?: string;
  passengerPhone?: string;
  preferredVehicle?: string;
  frequentPickups?: string[];
  frequentDestinations?: string[];
  pickupCounts?: Record<string, number>;
  destinationCounts?: Record<string, number>;
  lastUpdated?: string;
}
