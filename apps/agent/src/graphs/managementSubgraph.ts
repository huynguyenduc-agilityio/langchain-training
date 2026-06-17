import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  managementAgentNode,
  processToolResults,
  cancelConfirmNode,
  routeManagementAgent,
} from '@/nodes/index';
import { cancelTripTool, lookupTripsTool } from '@/tools/index';

const managementSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', managementAgentNode)
  .addNode('tool_node', new ToolNode([cancelTripTool, lookupTripsTool]))
  .addNode('process_results', processToolResults)
  .addNode('cancel_confirm', cancelConfirmNode)

  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeManagementAgent, {
    tool_node: 'tool_node',
    cancel_confirm: 'cancel_confirm',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addEdge('process_results', 'agent')
  .addEdge('cancel_confirm', 'agent');

export const managementSubgraph = managementSubgraphWorkflow.compile();
