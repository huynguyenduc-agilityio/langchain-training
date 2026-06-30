import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  rideAgentNode,
  processToolResults,
  rideConfirmNode,
  routeRideAgent,
  routeAfterToolResults,
  memoryWriterNode,
} from '@/nodes/ride';
import {
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
  retrieveKnowledgeTool,
} from '@/tools/index';

const rideSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', rideAgentNode)
  .addNode(
    'tool_node',
    new ToolNode([
      estimateRideTool,
      requestRideTool,
      matchDriverTool,
      retrieveKnowledgeTool,
    ]),
  )
  .addNode('process_results', processToolResults)
  .addNode('ride_confirm', rideConfirmNode, {
    ends: ['agent', 'memory_writer', '__end__'],
  })
  .addNode('memory_writer', memoryWriterNode)

  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeRideAgent, {
    tool_node: 'tool_node',
    ride_confirm: 'ride_confirm',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addConditionalEdges('process_results', routeAfterToolResults, {
    agent: 'agent',
    __end__: '__end__',
  })
  .addEdge('memory_writer', 'agent');

export const rideSubgraph = rideSubgraphWorkflow.compile();
