import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { getVectorStore } from '@/rag/vectorStore';
import { AGENT_TOOLS } from '@/constants';
import { RetrievedDocument } from '@/types';
import { logError } from '@repo/logger';

export const retrieveKnowledgeTool = tool(
  async ({
    query,
    category,
  }): Promise<{
    documents: RetrievedDocument[];
    query: string;
    totalResults: number;
  }> => {
    try {
      const vectorStore = await getVectorStore();

      // Build filter for category-based search
      const filter = category ? { category } : undefined;

      // Retrieve top-4 relevant documents with similarity scores
      const results = await vectorStore.similaritySearchWithScore(
        query,
        4,
        filter,
      );

      const documents: RetrievedDocument[] = results.map(([doc, score]) => ({
        content: doc.pageContent,
        source: doc.metadata.source || 'unknown',
        category: doc.metadata.category || 'general',
        score: parseFloat(score.toFixed(4)),
      }));

      return {
        documents,
        query,
        totalResults: documents.length,
      };
    } catch (error) {
      logError(error, '[RetrieveKnowledge] Error during retrieval:');
      return {
        documents: [],
        query,
        totalResults: 0,
      };
    }
  },
  {
    name: AGENT_TOOLS.RETRIEVE_KNOWLEDGE.name,
    description: AGENT_TOOLS.RETRIEVE_KNOWLEDGE.description,
    schema: z.object({
      query: z
        .string()
        .describe(
          'The search query to find relevant information in the knowledge base',
        ),
      category: z
        .enum(['faq', 'policies', 'locations'])
        .optional()
        .describe(
          'Optional category to narrow the search: faq (service questions), policies (rules & regulations), locations (Da Nang places & landmarks)',
        ),
    }),
  },
);
