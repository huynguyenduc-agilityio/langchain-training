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
  renderEstimateNode,
  renderMatchDriverNode,
} from '@/nodes/index';
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
  .addNode('render_estimate', renderEstimateNode)
  .addNode('render_match_driver', renderMatchDriverNode)
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
    render_estimate: 'render_estimate',
    render_match_driver: 'render_match_driver',
    agent: 'agent',
    __end__: '__end__',
  })
  .addEdge('render_estimate', '__end__')
  .addEdge('render_match_driver', '__end__')
  .addEdge('memory_writer', 'agent');

export const rideSubgraph = rideSubgraphWorkflow.compile();
