import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import {
  SystemMessage,
  HumanMessage,
  BaseMessage,
} from '@langchain/core/messages';

import { RideBookingState } from '@/state';
import { INTENT_CLASSIFIER_SYSTEM_PROMPT } from '@/prompts/index';
import { LLM_CONFIG } from '@/constants';

const intentSchema = z.object({
  category: z.enum([
    'estimate',
    'request',
    'cancel',
    'view_trips',
    'faq',
    'unknown',
  ]),
  confidence: z.number(),
});

import { logError } from '@repo/logger';

export async function intentClassifierNode(state: RideBookingState) {
  const model = new ChatOpenAI({
    model: LLM_CONFIG.DEFAULT_MODEL,
    temperature: 0,
    streaming: false,
    modelKwargs: {
      response_format: { type: 'json_object' },
    },
  });

  const systemMessage = new SystemMessage({
    content:
      INTENT_CLASSIFIER_SYSTEM_PROMPT +
      '\n\nYou MUST respond with a valid JSON object with exactly two fields: "category" and "confidence".',
  });

  // Extract only the last user message for classification.
  const messages = state.messages || [];
  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (m) =>
        m instanceof HumanMessage ||
        (m as BaseMessage)._getType() === 'human' ||
        (m as BaseMessage).type === 'human',
    );

  const classificationMessages = lastUserMessage
    ? [lastUserMessage]
    : messages.slice(-1);

  try {
    // Use .invoke() directly — this returns an AIMessage but we only read
    // its content and NEVER return it in the node output, so LangGraph's
    // messages reducer never appends it to state.messages.
    const response = await model.invoke([
      systemMessage,
      ...classificationMessages,
    ]);

    const raw =
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

    const parsed = intentSchema.parse(JSON.parse(raw));

    return {
      intent: parsed,
      // Explicitly NOT returning `messages` — this keeps the AIMessage
      // out of the conversation history and off the CopilotKit stream.
    };
  } catch (error) {
    logError(error, 'Failed to classify intent:');
    return {
      intent: {
        category: 'unknown' as const,
        confidence: 1.0,
      },
    };
  }
}
