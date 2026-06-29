import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

import { db } from '../db/index';
import { knowledgeDocuments } from '../db/schema';
import { getVectorStore } from './vectorStore';
import { logger, logError } from '@repo/logger';

/**
 * Load all knowledge documents from the Supabase DB table.
 * Content is managed via Supabase Dashboard — no local files needed.
 */
async function loadDocumentsFromDb(): Promise<Document[]> {
  const rows = await db.select().from(knowledgeDocuments);

  if (rows.length === 0) {
    logger.warn(
      'No documents found in knowledge_documents table. ' +
        'Add content via Supabase Dashboard or run the seed script.',
    );
    return [];
  }

  return rows.map(
    (row) =>
      new Document({
        pageContent: row.content,
        metadata: {
          source: row.id,
          title: row.title,
          category: row.category,
        },
      }),
  );
}

/**
 * Load all knowledge documents from DB, split them into chunks,
 * and enrich with category metadata for filtered retrieval.
 */
export async function loadAndSplitDocuments(): Promise<Document[]> {
  const rawDocs = await loadDocumentsFromDb();

  if (rawDocs.length === 0) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
    separators: ['\n---\n', '\n## ', '\n### ', '\n\n', '\n', ' '],
  });

  const splitDocs = await splitter.splitDocuments(rawDocs);

  // Filter out empty chunks or chunks that are just dividers like "---"
  const cleanDocs = splitDocs.filter((doc) => {
    const trimmed = doc.pageContent.trim();
    return trimmed.length > 0 && trimmed !== '---' && trimmed !== '***';
  });

  // Preserve category metadata from the source document
  const enrichedDocs = cleanDocs.map((doc) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        category: doc.metadata.category || 'general',
      },
    });
  });

  return enrichedDocs;
}

/**
 * Index all knowledge base documents into the PGVectorStore.
 */
export async function indexDocuments(): Promise<void> {
  logger.info('Loading knowledge documents from database...');

  const documents = await loadAndSplitDocuments();

  if (documents.length === 0) {
    logger.warn(
      'No documents to index. Add content to the knowledge_documents table.',
    );
    return;
  }

  logger.info(`Loaded ${documents.length} document chunks`);

  const vectorStore = await getVectorStore();

  // Clear existing documents to prevent duplicates on re-index
  try {
    await vectorStore.delete({ filter: {} });
    logger.info('Cleared existing documents from vector store');
  } catch {
    logger.info('No existing documents to clear (first run)');
  }

  // Add documents in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    await vectorStore.addDocuments(batch);
    logger.info(
      `Indexed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(documents.length / BATCH_SIZE)} (${batch.length} chunks)`,
    );
  }

  logger.info(
    `Successfully indexed ${documents.length} document chunks into PGVectorStore`,
  );
}

/**
 * Ensure the vector store has documents indexed.
 */
export async function ensureIndexed(): Promise<void> {
  try {
    const vectorStore = await getVectorStore();

    // Check if vector store already has documents
    const testResults = await vectorStore.similaritySearch('test', 1);

    if (testResults.length > 0) {
      logger.info('Knowledge base already indexed — skipping auto-index.');
      return;
    }

    logger.info(
      'Vector store is empty — running automatic indexing from database...',
    );
    await indexDocuments();
  } catch (error) {
    logError(
      error,
      'Auto-indexing failed (knowledge base may not be available):',
    );
  }
}
