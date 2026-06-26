import { BaseStore } from '@langchain/langgraph';
import { Trip, UserMemory } from '@/types';

/**
 * Check if a UserMemory object has any meaningful preference data
 * (not just empty arrays or missing fields).
 */
export function hasUserMemoryData(memory: UserMemory | undefined): boolean {
  if (!memory) return false;
  return !!(
    memory.preferredVehicle ||
    (memory.frequentPickups && memory.frequentPickups.length > 0) ||
    (memory.frequentDestinations && memory.frequentDestinations.length > 0) ||
    memory.passengerName ||
    memory.passengerPhone
  );
}

export async function readUserMemory(
  store: BaseStore,
  userId: string,
): Promise<UserMemory | undefined> {
  if (!store || !userId) {
    return undefined;
  }
  try {
    const namespace = ['user-memory', userId];
    const key = 'preferences';
    const item = await store.get(namespace, key);
    if (item && item.value) {
      const memory = item.value as UserMemory;
      if (hasUserMemoryData(memory)) {
        return memory;
      }
    }
  } catch (err) {
    console.error('Failed to read user memory:', err);
  }
  return undefined;
}

export async function writeUserMemory(
  store: BaseStore,
  userId: string,
  newTrip: Partial<Trip>,
): Promise<void> {
  if (!store || !userId || !newTrip) {
    return;
  }
  try {
    const namespace = ['user-memory', userId];
    const key = 'preferences';

    // Read current memory (default to empty object if undefined)
    const currentMemory = (await readUserMemory(store, userId)) || {};

    // Update names and phones
    const passengerName = newTrip.passengerName || currentMemory.passengerName;
    const passengerPhone =
      newTrip.passengerPhone || currentMemory.passengerPhone;
    const preferredVehicle =
      newTrip.vehicleType || currentMemory.preferredVehicle;

    // Update frequent pickups
    const pickupCounts = { ...(currentMemory.pickupCounts || {}) };
    if (newTrip.pickup) {
      pickupCounts[newTrip.pickup] = (pickupCounts[newTrip.pickup] || 0) + 1;
    }
    const frequentPickups = Object.entries(pickupCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([loc]) => loc);

    // Update frequent destinations
    const destinationCounts = { ...(currentMemory.destinationCounts || {}) };
    if (newTrip.destination) {
      destinationCounts[newTrip.destination] =
        (destinationCounts[newTrip.destination] || 0) + 1;
    }
    const frequentDestinations = Object.entries(destinationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([loc]) => loc);

    const updatedMemory: UserMemory = {
      passengerName,
      passengerPhone,
      preferredVehicle,
      frequentPickups,
      frequentDestinations,
      pickupCounts,
      destinationCounts,
      lastUpdated: new Date().toISOString(),
    };

    await store.put(namespace, key, updatedMemory);
  } catch (err) {
    console.error('Failed to write user memory:', err);
  }
}
