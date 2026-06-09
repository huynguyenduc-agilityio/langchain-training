import { StateGraph, START, MemorySaver } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { RideBookingStateAnnotation, RideBookingState } from '../state/index';
import {
  inputValidationNode,
  intentClassifierNode,
  supervisorRouter,
} from '../nodes/index';
import { rideSubgraph } from './rideSubgraph';
import { managementSubgraph } from './managementSubgraph';
import { infoSubgraph } from './infoSubgraph';

/**
 * Error response node for validation guardrail failures
 */
async function errorResponseNode(state: RideBookingState) {
  return {
    messages: [
      new AIMessage({
        content: state.validationError || 'An unexpected validation error occurred. Please try again.',
      }),
    ],
  };
}

/**
 * Build the City Ride Booking chatbot graph.
 */
export function buildGraph() {
  // Build Parent Graph Workflow
  const workflow = new StateGraph(RideBookingStateAnnotation)
    .addNode('input_validation', inputValidationNode)
    .addNode('classify_intent', intentClassifierNode)
    .addNode('ride_agent', rideSubgraph as any)
    .addNode('management_agent', managementSubgraph as any)
    .addNode('info_agent', infoSubgraph as any)
    .addNode('error_response', errorResponseNode)

    .addEdge(START, 'input_validation')
    .addEdge('input_validation', 'classify_intent')

    .addConditionalEdges('classify_intent', supervisorRouter as any, {
      ride_agent: 'ride_agent',
      management_agent: 'management_agent',
      info_agent: 'info_agent',
      error_response: 'error_response',
    })

    .addEdge('ride_agent', '__end__')
    .addEdge('management_agent', '__end__')
    .addEdge('info_agent', '__end__')
    .addEdge('error_response', '__end__');

  const memory = new MemorySaver();

  return workflow.compile({
    checkpointer: memory,
  });
}
