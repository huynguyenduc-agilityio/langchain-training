import { BaseStore } from '@langchain/langgraph';
import { Trip, UserMemory } from '@/types';

export async function readUserMemory(
  store: BaseStore,
  userId: string,
): Promise<UserMemory> {
  if (!store || !userId) {
    return {};
  }
  try {
    const namespace = ['user_memory', userId];
    const key = 'preferences';
    const item = await store.get(namespace, key);
    if (item && item.value) {
      return item.value as UserMemory;
    }
  } catch (err) {
    console.error('Failed to read user memory:', err);
  }
  return {};
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
    const namespace = ['user_memory', userId];
    const key = 'preferences';

    // Read current memory
    const currentMemory = await readUserMemory(store, userId);

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
