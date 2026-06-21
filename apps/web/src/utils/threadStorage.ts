import { THREAD_ID_KEY } from '@/constants';
import { generateUUID } from './uuid';

/**
 * Reads threadId from localStorage. Creates and persists a new one if not found.
 *
 * Designed as a lazy initializer for useState — safe to call during SSR
 * because it guards against the absence of `window`.
 */
export function getPersistedThreadId(): string {
  if (typeof window === 'undefined') {
    // SSR: return a throwaway ID — the client will hydrate with the real one.
    return generateUUID();
  }

  const saved = localStorage.getItem(THREAD_ID_KEY);
  if (saved) return saved;

  return createAndPersistThreadId();
}

/**
 * Generates a new threadId, saves it to localStorage, and returns it.
 * Call this when the user explicitly resets the conversation.
 */
export function createAndPersistThreadId(): string {
  const id = generateUUID();
  localStorage.setItem(THREAD_ID_KEY, id);
  return id;
}
