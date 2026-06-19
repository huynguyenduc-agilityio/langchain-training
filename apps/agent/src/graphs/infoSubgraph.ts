import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  infoAgentNode,
  processToolResults,
  routeAfterChat,
  routeAfterInfoToolResults,
} from '@/nodes/index';
import { lookupTripsTool } from '@/tools/index';

const infoSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', infoAgentNode)
  .addNode('tool_node', new ToolNode([lookupTripsTool]))
  .addNode('process_results', processToolResults)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeAfterChat, {
    tool_node: 'tool_node',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addConditionalEdges('process_results', routeAfterInfoToolResults, {
    agent: 'agent',
    __end__: '__end__',
  });

export const infoSubgraph = infoSubgraphWorkflow.compile();
