import { BaseStore } from '@langchain/langgraph';
import { Trip } from '@repo/shared';
import { UserMemory } from '@/types';

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

    const nowStr = new Date().toISOString();

    // Update frequent pickups
    const pickupCounts = { ...(currentMemory.pickupCounts || {}) };
    const pickupLastUsed = { ...(currentMemory.pickupLastUsed || {}) };
    if (newTrip.pickup) {
      pickupCounts[newTrip.pickup] = (pickupCounts[newTrip.pickup] || 0) + 1;
      pickupLastUsed[newTrip.pickup] = nowStr;
    }
    const frequentPickups = Object.entries(pickupCounts)
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        const timeA = new Date(pickupLastUsed[a[0]] || 0).getTime();
        const timeB = new Date(pickupLastUsed[b[0]] || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 3)
      .map(([loc]) => loc);

    // Update frequent destinations
    const destinationCounts = { ...(currentMemory.destinationCounts || {}) };
    const destinationLastUsed = {
      ...(currentMemory.destinationLastUsed || {}),
    };
    if (newTrip.destination) {
      destinationCounts[newTrip.destination] =
        (destinationCounts[newTrip.destination] || 0) + 1;
      destinationLastUsed[newTrip.destination] = nowStr;
    }
    const frequentDestinations = Object.entries(destinationCounts)
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        const timeA = new Date(destinationLastUsed[a[0]] || 0).getTime();
        const timeB = new Date(destinationLastUsed[b[0]] || 0).getTime();
        return timeB - timeA;
      })
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
      pickupLastUsed,
      destinationLastUsed,
      lastUpdated: nowStr,
    };

    await store.put(namespace, key, updatedMemory);
  } catch (err) {
    console.error('Failed to write user memory:', err);
  }
}

const INTERNAL_FIELDS = new Set([
  'pickupCounts',
  'destinationCounts',
  'pickupLastUsed',
  'destinationLastUsed',
  'lastUpdated',
]);

/**
 * Format user memory dynamically into a concise, clean bulleted list for LLM prompt context.
 * Internal fields (raw counts/timestamps) are filtered out, and preference keys are formatted
 * from camelCase to Title Case automatically.
 */
export function formatUserMemory(memory: UserMemory | undefined): string {
  if (!memory || !hasUserMemoryData(memory)) {
    return 'None';
  }

  const lines = Object.entries(memory)
    .filter(([key, val]) => {
      if (INTERNAL_FIELDS.has(key)) return false;
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    })
    .map(([key, val]) => {
      // Convert camelCase to Title Case (e.g. preferredVehicle -> Preferred Vehicle)
      const title = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      const formattedVal = Array.isArray(val) ? val.join(', ') : val;
      return `  * ${title}: ${formattedVal}`;
    });

  return lines.length > 0 ? lines.join('\n') : 'None';
}
