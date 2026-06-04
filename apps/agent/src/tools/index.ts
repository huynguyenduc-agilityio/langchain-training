export * from './customerLookup';
export * from './intentClassifier';
export * from './escalationDecision';
export * from './replyGenerator';

import { customerLookupTool } from './customerLookup';
import { intentClassifierTool } from './intentClassifier';
import { escalationDecisionTool } from './escalationDecision';
import { replyGeneratorTool } from './replyGenerator';

/**
 * All tools as an array for use in graph nodes.
 */
export const tools = [
  customerLookupTool,
  intentClassifierTool,
  escalationDecisionTool,
  replyGeneratorTool,
];
