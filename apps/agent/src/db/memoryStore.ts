import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';

import { logError } from '@repo/logger';
import { env } from '../config/env';

let _store: PostgresStore | null = null;
let _setupPromise: Promise<PostgresStore> | null = null;

export async function getMemoryStore(): Promise<PostgresStore> {
  if (_store) return _store;
  if (_setupPromise) return _setupPromise;

  const connString = env.DATABASE_DIRECT_URL;

  _setupPromise = (async () => {
    try {
      const store = new PostgresStore({
        connectionOptions: {
          connectionString: connString,
          max: 3,
        },
      });

      await store.setup();

      _store = store;

      return store;
    } catch (err) {
      _setupPromise = null;
      logError(err, 'Failed to setup postgres memory store:');
      throw err;
    }
  })();

  return _setupPromise;
}
