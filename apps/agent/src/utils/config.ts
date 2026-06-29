import { RunnableConfig } from '@langchain/core/runnables';
import {
  CallbackManager,
  BaseCallbackManager,
} from '@langchain/core/callbacks/manager';

/**
 * Deduplicates callbacks in RunnableConfig to prevent duplicate stream events
 * (such as on_chat_model_stream) when subgraphs inherit handlers from parent graphs.
 */
export function getCleanConfig(config: RunnableConfig): RunnableConfig {
  if (!config.callbacks) return config;

  const originalManager = config.callbacks;
  if (!(originalManager instanceof BaseCallbackManager)) {
    return config;
  }

  const manager = originalManager as unknown as CallbackManager;
  const handlers = manager.handlers || [];
  const inheritableHandlers = manager.inheritableHandlers || [];

  const seenTypes = new Set<string>();
  const uniqueHandlers = handlers.filter((handler) => {
    const name = handler.name || handler.constructor?.name;
    if (!name) return true;
    if (seenTypes.has(name)) return false;
    seenTypes.add(name);
    return true;
  });

  const uniqueInheritableHandlers = inheritableHandlers.filter((handler) => {
    const name = handler.name || handler.constructor?.name;
    return uniqueHandlers.some(
      (uh) => (uh.name || uh.constructor?.name) === name,
    );
  });

  // Get parentRunId from runId (for RunManager subclasses) or standard parent fields
  const parentRunId =
    (manager as unknown as { runId?: string }).runId ??
    manager.getParentRunId() ??
    (manager as unknown as { _parentRunId?: string })._parentRunId;

  const cleanManager = new CallbackManager(parentRunId, {
    handlers: uniqueHandlers,
    inheritableHandlers: uniqueInheritableHandlers,
    tags: manager.tags || [],
    inheritableTags: manager.inheritableTags || [],
    metadata: manager.metadata || {},
    inheritableMetadata: manager.inheritableMetadata || {},
  });

  return {
    ...config,
    callbacks: cleanManager,
  };
}
