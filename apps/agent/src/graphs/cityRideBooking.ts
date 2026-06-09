import { StateGraph, START, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage } from '@langchain/core/messages';
import { RideBookingStateAnnotation, RideBookingState } from '../state/index';
import {
  inputValidationNode,
  intentClassifierNode,
  supervisorRouter,
  rideAgentNode,
  managementAgentNode,
  infoAgentNode,
  processToolResults,
  routeAfterChat,
} from '../nodes/index';
import { tools } from '../tools/index';

/**
 * Error response node for validation guardrail failures
 */
async function errorResponseNode(state: RideBookingState) {
  console.log('\n=== ERROR RESPONSE NODE ===');
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
  const toolNode = new ToolNode(tools);

  const workflow = new StateGraph(RideBookingStateAnnotation)
    // Add all nodes
    .addNode('input_validation', inputValidationNode)
    .addNode('classify_intent', intentClassifierNode)
    .addNode('ride_agent', rideAgentNode)
    .addNode('management_agent', managementAgentNode)
    .addNode('info_agent', infoAgentNode)
    .addNode('error_response', errorResponseNode)
    .addNode('tool_node', toolNode)
    .addNode('process_results', processToolResults)

    // Flow edges
    .addEdge(START, 'input_validation')
    .addEdge('input_validation', 'classify_intent')

    // Router edge from classify_intent
    .addConditionalEdges('classify_intent', supervisorRouter as any, {
      ride_agent: 'ride_agent',
      management_agent: 'management_agent',
      info_agent: 'info_agent',
      error_response: 'error_response',
    })

    // Routing from agents
    .addConditionalEdges('ride_agent', routeAfterChat as any, {
      tool_node: 'tool_node',
      __end__: '__end__',
    })
    .addConditionalEdges('management_agent', routeAfterChat as any, {
      tool_node: 'tool_node',
      __end__: '__end__',
    })
    .addConditionalEdges('info_agent', routeAfterChat as any, {
      tool_node: 'tool_node',
      __end__: '__end__',
    })

    // Error response end edge
    .addEdge('error_response', '__end__')

    // Tool execution loop
    .addEdge('tool_node', 'process_results')

    // Route from process_results back to supervisor / subagents
    .addConditionalEdges('process_results', supervisorRouter as any, {
      ride_agent: 'ride_agent',
      management_agent: 'management_agent',
      info_agent: 'info_agent',
      error_response: 'error_response',
    });

  const memory = new MemorySaver();

  return workflow.compile({
    checkpointer: memory,
  });
}
