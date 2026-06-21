import { StateGraph, START } from '@langchain/langgraph';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  inputValidationNode,
  intentClassifierNode,
  supervisorRouter,
  inputValidationRouter,
  errorResponseNode,
  supervisorNode,
} from '@/nodes/index';
import { rideSubgraph } from './rideSubgraph';
import { managementSubgraph } from './managementSubgraph';
import { infoSubgraph } from './infoSubgraph';
import { getCheckpointer } from '@/db/checkpointer';

/**
 * Build the City Ride Booking chatbot graph.
 * Async because PostgresSaver.setup() must be awaited on first call.
 */
export async function buildGraph() {
  // Build Parent Graph Workflow
  const workflow = new StateGraph(RideBookingStateAnnotation)
    .addNode('input_validation', inputValidationNode)
    .addNode('classify_intent', intentClassifierNode)
    .addNode('supervisor', supervisorNode)
    .addNode('ride_agent', rideSubgraph)
    .addNode('management_agent', managementSubgraph)
    .addNode('info_agent', infoSubgraph)
    .addNode('error_response', errorResponseNode)

    .addEdge(START, 'input_validation')

    // 1. Guardrail conditional routing
    .addConditionalEdges('input_validation', inputValidationRouter, {
      error_response: 'error_response',
      classify_intent: 'classify_intent',
    })

    // 2. Classify intent goes to Supervisor
    .addEdge('classify_intent', 'supervisor')

    // 3. Supervisor routes to target sub-agents or ends
    .addConditionalEdges('supervisor', supervisorRouter, {
      ride_agent: 'ride_agent',
      management_agent: 'management_agent',
      info_agent: 'info_agent',
      error_response: 'error_response',
      __end__: '__end__',
    })

    // 4. Subgraphs route back to Supervisor
    .addEdge('ride_agent', 'supervisor')
    .addEdge('management_agent', 'supervisor')
    .addEdge('info_agent', 'supervisor')
    .addEdge('error_response', '__end__');

  const checkpointer = await getCheckpointer();

  return workflow.compile({ checkpointer });
}
