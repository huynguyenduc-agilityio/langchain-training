import { BaseStore } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import { RideBookingState } from '@/state';
import { getUserFromState, writeUserMemory } from '@/utils';

/**
 * Node to persist user travel patterns (long-term memory) after a successful ride request.
 */
export async function memoryWriterNode(
  state: RideBookingState,
  config?: RunnableConfig & { store?: BaseStore },
) {
  const { userId } = getUserFromState(state);
  const tripDraft = state.tripDraft;
  const store = config?.store;

  if (userId && tripDraft && store) {
    try {
      await writeUserMemory(store, userId, tripDraft);
    } catch (error) {
      console.error('[MemoryWriterNode] Error writing user memory:', error);
    }
  }

  return {};
}
