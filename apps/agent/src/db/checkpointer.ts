import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let _checkpointer: PostgresSaver | null = null;
let _setupPromise: Promise<PostgresSaver> | null = null;

export async function getCheckpointer(): Promise<PostgresSaver> {
  if (_checkpointer) return _checkpointer;
  if (_setupPromise) return _setupPromise;

  const connString = process.env.DATABASE_DIRECT_URL;
  if (!connString) {
    throw new Error(
      'DATABASE_DIRECT_URL is not set. Add it to .env — it must point to the ' +
        'direct PostgreSQL connection (port 5432), not the PgBouncer pooler.',
    );
  }

  _setupPromise = (async () => {
    try {
      const checkpointer = PostgresSaver.fromConnString(connString);
      await checkpointer.setup();
      _checkpointer = checkpointer;
      return checkpointer;
    } catch (err) {
      _setupPromise = null;
      throw err;
    }
  })();

  return _setupPromise;
}
