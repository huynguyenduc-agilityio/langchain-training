import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { LLM_CONFIG } from '@/constants';
import { logError } from '@repo/logger';

const baseModel = new ChatOpenAI({
  model: LLM_CONFIG.DEFAULT_MODEL,
  temperature: 0.3,
  streaming: false,
});

/**
 * Query Rewriter Node
 *
 * Rewrites the retrieval query when the retrieval grader determines
 * that retrieved documents are not relevant enough.
 *
 * Analyzes the original query and reformulates it to improve retrieval results.
 * Increments retryCount to prevent infinite loops (max 2 retries).
 */
export async function queryRewriterNode(state: RideBookingState) {
  const originalQuery = state.retrievalQuery || '';
  const currentRetryCount = state.retrievalRetryCount || 0;

  try {
    const systemPrompt = `You are a query rewriting specialist. The user asked a question, but the initial search did not return relevant results from our knowledge base.

Your task: Rewrite the query to improve search results. The knowledge base contains:
- FAQ about a ride-hailing service (operating hours, pricing, vehicle types, booking process)
- Policies (cancellation, refund, disputes, safety)  
- Location guides for Da Nang city (landmarks, markets, beaches, restaurants, districts)

Strategies:
- Use more general or alternative terms
- Break complex questions into simpler search terms
- Try English equivalents for Vietnamese location names
- Focus on the core topic the user is asking about

Return ONLY the rewritten query text, nothing else.`;

    const humanPrompt = `Original query that got poor results: "${originalQuery}"

Rewrite this query to get better search results:`;

    const response = await baseModel.invoke([
      new SystemMessage({ content: systemPrompt }),
      new HumanMessage({ content: humanPrompt }),
    ]);

    const rewrittenQuery =
      typeof response.content === 'string'
        ? response.content.trim()
        : originalQuery;

    return {
      retrievalQuery: rewrittenQuery,
      retrievalRetryCount: currentRetryCount + 1,
      retrievedDocuments: [],
      retrievalRelevant: null,
    };
  } catch (error) {
    logError(error, '[QueryRewriter] Error during query rewriting:');
    return {
      retrievalRetryCount: currentRetryCount + 1,
    };
  }
}
