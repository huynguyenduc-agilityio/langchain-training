import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SystemMessage } from '@langchain/core/messages';
import { RideBookingState } from '../state/state';
import { INTENT_CLASSIFIER_SYSTEM_PROMPT } from '../prompts/index';

export async function intentClassifierNode(state: RideBookingState) {
  console.log('\n=== INTENT CLASSIFIER NODE ===');

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
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

    console.log(`Classification result: ${response.category} (${response.confidence})`);

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
