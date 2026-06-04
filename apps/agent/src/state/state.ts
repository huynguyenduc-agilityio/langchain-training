/**
 * Customer Support Agent State Definition
 *
 * Defines the state schema (annotations) used by the LangGraph workflow.
 * All nodes in the graph read from and write to this shared state.
 *
 * Updated for @copilotkit/sdk-js@latest — import from "langgraph" subpath.
 */

import { Annotation } from '@langchain/langgraph';
import { CopilotKitStateAnnotation } from '@copilotkit/sdk-js/langgraph';

/**
 * Customer data structure from tickets dataset
 */
export interface CustomerData {
  id: number;
  customerID: string;
  gender: string;
  SeniorCitizen: string;
  Partner: string;
  Dependents: string;
  tenure: string;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: string;
  TotalCharges: string;
  Churn: string;
  status: string;
}

/**
 * Intent classification result
 */
export interface IntentResult {
  category:
    | 'billing_issue'
    | 'service_outage'
    | 'cancellation'
    | 'tech_support'
    | 'upgrade_request'
    | 'payment_issue'
    | 'general_inquiry';
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  keywords: string[];
}

/**
 * Escalation decision
 */
export interface EscalationResult {
  required: boolean;
  reason: string;
  ticketId?: string;
  assignedTo?: 'billing' | 'tech' | 'retention';
  priority: 1 | 2 | 3; // 1 = high, 2 = medium, 3 = low
}

/**
 * Reply with suggested actions
 */
export interface ReplyResult {
  message: string;
  suggestedActions: string[];
}

/**
 * Customer Support Agent State
 *
 * Extends CopilotKitStateAnnotation to integrate with the frontend via AG-UI protocol.
 */
export const CustomerSupportStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,

  // Customer list (synced with frontend via CopilotKit shared state)
  customers: Annotation<CustomerData[]>({
    reducer: (_, value) => value,
    default: () => [],
  }),

  // Current customer lookup result
  currentCustomer: Annotation<{
    id: string;
    found: boolean;
    data: CustomerData | null;
  }>({
    reducer: (_, value) => value,
    default: () => ({ id: '', found: false, data: null }),
  }),

  // Intent classification
  intent: Annotation<IntentResult | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Reply generation
  reply: Annotation<ReplyResult | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Escalation decision
  escalation: Annotation<EscalationResult | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),
});

export type CustomerSupportState = typeof CustomerSupportStateAnnotation.State;
