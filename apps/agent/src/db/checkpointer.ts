import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let _checkpointer: PostgresSaver | null = null;

/**
 * Returns a singleton PostgresSaver instance backed by the direct Supabase connection.
 */
export async function getCheckpointer(): Promise<PostgresSaver> {
  if (_checkpointer) return _checkpointer;

  const connString = process.env.DATABASE_DIRECT_URL;
  if (!connString) {
    throw new Error(
      'DATABASE_DIRECT_URL is not set. Add it to .env — it must point to the ' +
        'direct PostgreSQL connection (port 5432), not the PgBouncer pooler.',
    );
  }

  const checkpointer = PostgresSaver.fromConnString(connString);

  // Create checkpoint tables if not yet present (idempotent).
  await checkpointer.setup();

  _checkpointer = checkpointer;
  return _checkpointer;
}
