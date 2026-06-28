import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';

import { env } from '../config/env';
import { logError } from '@repo/logger';

let _vectorStore: PGVectorStore | null = null;
let _setupPromise: Promise<PGVectorStore> | null = null;

/**
 * Configuration for PGVectorStore (Supabase PostgreSQL with pgvector extension).
 */
function getVectorStoreConfig() {
  return {
    postgresConnectionOptions: {
      connectionString: env.DATABASE_DIRECT_URL,
    },
    tableName: 'langchain_documents',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  };
}

/**
 * Get the shared OpenAI embeddings instance.
 * Uses text-embedding-3-small for cost-efficiency and good performance.
 */
export function getEmbeddings() {
  return new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    openAIApiKey: env.OPENAI_API_KEY,
  });
}

/**
 * Get or create the PGVectorStore singleton instance.
 * Follows the same singleton pattern as getCheckpointer() and getMemoryStore().
 */
export async function getVectorStore(): Promise<PGVectorStore> {
  if (_vectorStore) return _vectorStore;
  if (_setupPromise) return _setupPromise;

  _setupPromise = (async () => {
    try {
      const embeddings = getEmbeddings();
      const config = getVectorStoreConfig();

      const store = await PGVectorStore.initialize(embeddings, config);

      _vectorStore = store;
      return store;
    } catch (err) {
      _setupPromise = null;
      logError(err, 'Failed to initialize PGVectorStore:');
      throw err;
    }
  })();

  return _setupPromise;
}
