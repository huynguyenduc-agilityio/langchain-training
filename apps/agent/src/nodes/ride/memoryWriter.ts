import { BaseStore } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

import { RideBookingState } from '@/state';
import { getUserFromState, writeUserMemory } from '@/utils';
import { getMemoryStore } from '@/db/memoryStore';

/**
 * Node to persist user travel patterns (long-term memory) after a successful ride request.
 */
export async function memoryWriterNode(
  state: RideBookingState,
  config?: RunnableConfig & { store?: BaseStore },
) {
  const { userId: contextUserId } = getUserFromState(state);
  const userId =
    contextUserId ||
    config?.configurable?.copilotkit_properties?.userId ||
    config?.configurable?.userId;
  const tripDraft = state.tripDraft;
  const store = await getMemoryStore();

  if (userId && tripDraft && store) {
    try {
      await writeUserMemory(store, userId, tripDraft);
    } catch (error) {
      console.error('[MemoryWriterNode] Error writing user memory:', error);
    }
  }

  return {};
}
