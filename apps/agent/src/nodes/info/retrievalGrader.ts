import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { LLM_CONFIG } from '@/constants';
import { logError } from '@repo/logger';

const gradingResultSchema = z.object({
  relevantIndexes: z
    .array(z.number())
    .describe('Indexes (0-based) of documents that are relevant to the query'),
  overallRelevant: z
    .boolean()
    .describe(
      'Whether there are enough relevant documents to answer the user query',
    ),
});

/**
 * Retrieval Grader Node
 *
 * Evaluates the relevance of retrieved documents against the user's query.
 * Uses LLM-as-Judge pattern with structured output.
 *
 * Routes:
 * - If relevant docs found → sets retrievalRelevant = true → agent generates answer
 * - If no relevant docs → sets retrievalRelevant = false → query_rewriter rewrites
 */
export async function retrievalGraderNode(state: RideBookingState) {
  const documents = state.retrievedDocuments || [];
  const query = state.retrievalQuery || '';

  // If no documents were retrieved, mark as not relevant
  if (documents.length === 0) {
    return {
      retrievalRelevant: false,
    };
  }

  try {
    const model = new ChatOpenAI({
      model: LLM_CONFIG.DEFAULT_MODEL,
      temperature: 0,
      streaming: false,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      gradingResultSchema,
      { name: 'grade_documents' },
    );

    const docsText = documents
      .map(
        (doc, i) =>
          `[Document ${i}] (score: ${doc.score}, category: ${doc.category})\n${doc.content}`,
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are a document relevance grader. Given a user query and a set of retrieved documents, determine which documents are relevant to answering the query.

A document is relevant if it contains information that directly helps answer the user's question.
A document is NOT relevant if it discusses a completely different topic.

Set overallRelevant to true if at least one document provides useful information to answer the query.
Set overallRelevant to false only if NONE of the documents are helpful.`;

    const humanPrompt = `User Query: "${query}"

Retrieved Documents:
${docsText}

Grade each document and determine overall relevance.`;

    const result = await modelWithStructuredOutput.invoke([
      new SystemMessage({ content: systemPrompt }),
      new HumanMessage({ content: humanPrompt }),
    ]);

    // Filter to keep only relevant documents
    const filteredDocs = documents.filter((_, index) =>
      result.relevantIndexes.includes(index),
    );

    return {
      retrievedDocuments: filteredDocs.length > 0 ? filteredDocs : documents,
      retrievalRelevant: result.overallRelevant,
    };
  } catch (error) {
    logError(error, '[RetrievalGrader] Error during grading:');
    // On error, assume documents are relevant to avoid blocking the flow
    return {
      retrievalRelevant: true,
    };
  }
}
