import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { RideBookingStateAnnotation } from '../state/index';
import {
  rideAgentNode,
  processToolResults,
  routeAfterChat,
} from '../nodes/index';
import {
  estimateRideTool,
  requestRideTool,
  matchDriverTool,
} from '../tools/index';

const rideSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', rideAgentNode)
  .addNode('tool_node', new ToolNode([estimateRideTool, requestRideTool, matchDriverTool]))
  .addNode('process_results', processToolResults)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeAfterChat as any, {
    tool_node: 'tool_node',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addEdge('process_results', 'agent');

export const rideSubgraph = rideSubgraphWorkflow.compile();
