import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { RideBookingState } from '../state/state';
import { INTENT_CLASSIFIER_SYSTEM_PROMPT } from '../prompts/index';
import { LLM_CONFIG } from '../constants';

export async function intentClassifierNode(state: RideBookingState) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
  });

  const schema = z.object({
    category: z.enum(['estimate', 'request', 'cancel', 'view_trips', 'faq', 'unknown']),
    confidence: z.number(),
  });

  const modelWithStructuredOutput = model.withStructuredOutput(schema);

  const systemMessage = new SystemMessage({
    content: INTENT_CLASSIFIER_SYSTEM_PROMPT,
  });

  // Extract only the last user message for classification.
  // Using the full conversation history (which includes tool calls, tool results,
  // and AI responses) confuses the classifier on subsequent requests.
  const messages = state.messages || [];
  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (m) =>
        m instanceof HumanMessage ||
        (m as any)._getType?.() === 'human' ||
        (m as any).type === 'human'
    );

  const classificationMessages = lastUserMessage
    ? [lastUserMessage]
    : messages.slice(-1);

  try {
    const response = await modelWithStructuredOutput.invoke([
      systemMessage,
      ...classificationMessages,
    ]);

    return {
      intent: response,
    };
  } catch (error) {
    console.error('Failed to classify intent:', error);
    return {
      intent: {
        category: 'unknown' as const,
        confidence: 1.0,
      },
    };
  }
}

