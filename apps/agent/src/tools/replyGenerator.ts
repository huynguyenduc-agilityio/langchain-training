/**
 * Reply Generator Tool
 *
 * AI-powered personalized reply generation with context-aware fallback.
 * Uses customer data and classified intent to generate helpful responses.
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { findCustomerById } from '../utils/dataLoader';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { REPLY_GENERATOR_PROMPT } from '../prompts/index';

export const replyGeneratorTool = tool(
  async ({ customerId, intent, message }) => {
    // Get customer data if available
    const customer = customerId ? findCustomerById(customerId) : null;

    // Initialize LLM
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    // Build prompt using extracted template
    const systemPrompt = REPLY_GENERATOR_PROMPT(customer, intent, message);

    try {
      // Invoke LLM with context
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message),
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed);
      } catch {
        // If LLM didn't return JSON, wrap it
        return JSON.stringify({
          message: content,
          suggestedActions: [
            'View account details',
            'Speak to specialist',
            'Explore options',
          ],
        });
      }
    } catch (error) {
      console.error('LLM reply generation failed:', error);

      // Fallback to smart template
      const fallbackReply = customer
        ? `I understand your ${intent.replace(
            /_/g,
            ' ',
          )} concern. I can see you're on our ${
            customer.InternetService
          } service at $${
            customer.MonthlyCharges
          }/month. Let me help you with this.`
        : "I'd be happy to help! Could you provide your Customer ID so I can give you personalized assistance?";

      return JSON.stringify({
        message: fallbackReply,
        suggestedActions: ['View account', 'Contact specialist'],
      });
    }
  },
  {
    name: 'generateReply',
    description:
      'Generate a personalized response based on customer information and their intent.',
    schema: z.object({
      customerId: z
        .string()
        .optional()
        .describe('The customer ID if available'),
      intent: z.string().describe('The classified intent category'),
      message: z.string().describe('The original customer message'),
    }),
  },
);
