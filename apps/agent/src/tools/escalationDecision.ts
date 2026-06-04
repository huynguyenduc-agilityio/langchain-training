/**
 * Escalation Decision Tool
 *
 * AI-powered escalation analysis with rule-based fallback.
 * Determines if a customer issue should be escalated to a human agent.
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { findCustomerById } from '../utils/dataLoader';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ESCALATION_DECISION_PROMPT } from '../prompts/index';

export const escalationDecisionTool = tool(
  async ({ customerId, intent, urgency }) => {
    // Get customer data
    const customer = customerId ? findCustomerById(customerId) : null;

    // Initialize AI model
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    // Build prompt using extracted template
    const systemPrompt = ESCALATION_DECISION_PROMPT(customer, intent, urgency);

    try {
      // Invoke AI for escalation decision
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Should this case be escalated?`),
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Parse AI decision
      try {
        const parsed = JSON.parse(content);

        // Generate ticket ID if escalating
        if (parsed.required) {
          parsed.ticketId = `TKT-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()}`;
        }

        return JSON.stringify(parsed);
      } catch (parseError) {
        console.error('AI escalation decision parse error:', parseError);
        return fallbackRuleBasedEscalation(customerId, intent, urgency);
      }
    } catch (error) {
      console.error('AI escalation decision failed:', error);
      return fallbackRuleBasedEscalation(customerId, intent, urgency);
    }
  },
  {
    name: 'checkEscalation',
    description:
      'Determine if the customer issue should be escalated to a human agent based on urgency, customer profile, and issue type.',
    schema: z.object({
      customerId: z
        .string()
        .optional()
        .describe('The customer ID if available'),
      intent: z.string().describe('The classified intent category'),
      urgency: z.enum(['low', 'medium', 'high']).describe('The urgency level'),
    }),
  },
);

// Fallback rule-based escalation if AI fails
function fallbackRuleBasedEscalation(
  customerId: string | undefined,
  intent: string,
  urgency: string,
) {
  let shouldEscalate = false;
  let reason = '';
  let assignedTo: 'billing' | 'tech' | 'retention' = 'tech';
  let priority: 1 | 2 | 3 = 3;
  let suggestAiFirst = false;

  if (urgency === 'high') {
    shouldEscalate = true;
    reason = 'High urgency issue detected';
    priority = 1;
  }

  if (customerId) {
    const customer = findCustomerById(customerId);

    if (customer) {
      if (customer.Churn === 'Yes') {
        shouldEscalate = true;
        reason = reason
          ? `${reason}; Customer at risk of churn`
          : 'Customer at risk of churn - retention priority';
        assignedTo = 'retention';
        priority = 1;
      }

      if (customer.SeniorCitizen === '1') {
        shouldEscalate = true;
        reason = reason
          ? `${reason}; Senior citizen`
          : 'Senior citizen requiring special assistance';
        if (priority > 2) priority = 2;
      }

      if (
        parseInt(customer.tenure) > 50 ||
        parseFloat(customer.MonthlyCharges) > 80
      ) {
        shouldEscalate = true;
        reason = reason
          ? `${reason}; High-value customer`
          : 'High-value customer - priority handling';
        if (priority > 2) priority = 2;
      }

      if (
        urgency === 'high' &&
        customer.Churn === 'No' &&
        (intent === 'service_outage' ||
          intent === 'tech_support' ||
          intent === 'internet_issue')
      ) {
        suggestAiFirst = true;
        shouldEscalate = false;
        reason =
          'High urgency tech issue - offering AI suggestions first before escalation';
        priority = 2;
      }
    }
  }

  if (intent === 'billing_issue' || intent === 'payment_issue') {
    assignedTo = 'billing';
  } else if (intent === 'cancellation') {
    assignedTo = 'retention';
    shouldEscalate = true;
    reason = reason
      ? `${reason}; Cancellation request`
      : 'Cancellation request - requires retention team';
    priority = 1;
  } else if (intent === 'service_outage' || intent === 'tech_support') {
    assignedTo = 'tech';
  }

  const ticketId = shouldEscalate
    ? `TKT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`
    : undefined;

  return JSON.stringify({
    required: shouldEscalate,
    reason: reason || 'No escalation needed - can be handled by AI assistant',
    ticketId: ticketId,
    assignedTo: assignedTo,
    priority: priority,
    suggestAiFirst: suggestAiFirst,
  });
}
