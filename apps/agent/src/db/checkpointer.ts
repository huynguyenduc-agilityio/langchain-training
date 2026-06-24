import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { env } from '../config/env';
import { logError } from '@repo/logger';

let _checkpointer: PostgresSaver | null = null;
let _setupPromise: Promise<PostgresSaver> | null = null;

export async function getCheckpointer(): Promise<PostgresSaver> {
  if (_checkpointer) return _checkpointer;
  if (_setupPromise) return _setupPromise;

  const connString = env.DATABASE_DIRECT_URL;

  _setupPromise = (async () => {
    try {
      const checkpointer = PostgresSaver.fromConnString(connString);

      await checkpointer.setup();

      _checkpointer = checkpointer;

      return checkpointer;
    } catch (err) {
      _setupPromise = null;
      logError(err, 'Failed to setup postgres checkpointer:');
      throw err;
    }
  })();

  return _setupPromise;
}
