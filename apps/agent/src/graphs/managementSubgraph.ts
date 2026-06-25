import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  managementAgentNode,
  processToolResults,
  cancelConfirmNode,
  routeManagementAgent,
} from '@/nodes/index';
import { lookupTripsTool } from '@/tools/index';

const managementSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', managementAgentNode)
  .addNode('tool_node', new ToolNode([lookupTripsTool]))
  .addNode('process_results', processToolResults)
  .addNode('cancel_confirm', cancelConfirmNode, {
    ends: ['agent'],
  })

  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeManagementAgent, {
    tool_node: 'tool_node',
    cancel_confirm: 'cancel_confirm',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addEdge('process_results', 'agent');

export const managementSubgraph = managementSubgraphWorkflow.compile();
