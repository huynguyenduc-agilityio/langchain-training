/**
 * Intent Classifier Tool
 *
 * AI-powered intent classification with keyword-based fallback.
 * Uses ChatOpenAI to classify customer messages into telecom support categories.
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { INTENT_CLASSIFIER_PROMPT } from '../prompts/index';

export const intentClassifierTool = tool(
  async ({ message }) => {
    // Initialize AI model
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    try {
      // Invoke AI for classification
      const response = await model.invoke([
        new SystemMessage(INTENT_CLASSIFIER_PROMPT),
        new HumanMessage(message),
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Try to parse AI response as JSON
      try {
        const parsed = JSON.parse(content);

        // Validate the response has required fields
        if (!parsed.category || !parsed.urgency) {
          throw new Error('Invalid AI response format');
        }

        return JSON.stringify(parsed);
      } catch (parseError) {
        console.error('AI classification parse error:', parseError);
        // Fallback to keyword matching
        return fallbackKeywordClassification(message);
      }
    } catch (error) {
      console.error('AI intent classification failed:', error);
      // Fallback to keyword matching
      return fallbackKeywordClassification(message);
    }
  },
  {
    name: 'classifyIntent',
    description:
      "Classify the customer's intent and urgency level based on their message. Returns intent category, urgency level, and confidence score.",
    schema: z.object({
      message: z.string().describe("The customer's message to classify"),
    }),
  },
);

// Fallback keyword-based classification if AI fails
function fallbackKeywordClassification(message: string) {
  const lowerMessage = message.toLowerCase();

  const intentPatterns: Record<string, string[]> = {
    billing_issue: [
      'bill',
      'charge',
      'payment',
      'invoice',
      'expensive',
      'cost',
      'price',
      'refund',
      'discount',
    ],
    service_outage: [
      'not working',
      'down',
      'outage',
      'slow',
      'disconnected',
      'no internet',
      'connection',
    ],
    cancellation: [
      'cancel',
      'terminate',
      'stop service',
      'end subscription',
      'quit',
    ],
    tech_support: [
      'help',
      'support',
      'issue',
      'problem',
      'error',
      'configure',
      'setup',
      'install',
    ],
    upgrade_request: [
      'upgrade',
      'faster',
      'better plan',
      'fiber',
      'premium',
      'more speed',
    ],
    payment_issue: [
      'payment failed',
      "can't pay",
      'declined',
      'payment error',
      'autopay',
    ],
    general_inquiry: [
      'hello',
      'hi',
      'info',
      'question',
      'how',
      'what',
      'when',
      'where',
    ],
  };

  let bestIntent = 'general_inquiry';
  let maxMatches = 0;
  let matchedKeywords: string[] = [];

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    const matches = keywords.filter((keyword) =>
      lowerMessage.includes(keyword),
    );
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      bestIntent = intent;
      matchedKeywords = matches;
    }
  }

  let urgency: 'low' | 'medium' | 'high' = 'low';

  if (
    bestIntent === 'service_outage' ||
    bestIntent === 'cancellation' ||
    bestIntent === 'payment_issue'
  ) {
    urgency = 'high';
  } else if (bestIntent === 'billing_issue' || bestIntent === 'tech_support') {
    urgency = 'medium';
  }

  const urgentKeywords = [
    'urgent',
    'emergency',
    'immediately',
    'asap',
    'critical',
    'now',
  ];
  if (urgentKeywords.some((kw) => lowerMessage.includes(kw))) {
    urgency = 'high';
  }

  const confidence =
    maxMatches > 0 ? Math.min(0.5 + maxMatches * 0.15, 0.95) : 0.6;

  return JSON.stringify({
    category: bestIntent,
    urgency: urgency,
    confidence: confidence,
    keywords: matchedKeywords,
  });
}
