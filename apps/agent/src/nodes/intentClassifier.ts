import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SystemMessage } from '@langchain/core/messages';
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

  try {
    const response = await modelWithStructuredOutput.invoke([
      systemMessage,
      ...state.messages,
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
