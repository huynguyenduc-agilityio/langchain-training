import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { RideBookingStateAnnotation } from '../state/index';
import {
  infoAgentNode,
  processToolResults,
  routeAfterChat,
} from '../nodes/index';
import {
  lookupTripsTool,
} from '../tools/index';

const infoSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', infoAgentNode)
  .addNode('tool_node', new ToolNode([lookupTripsTool]))
  .addNode('process_results', processToolResults)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeAfterChat as any, {
    tool_node: 'tool_node',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addEdge('process_results', 'agent');

export const infoSubgraph = infoSubgraphWorkflow.compile();
