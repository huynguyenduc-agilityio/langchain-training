import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  managementAgentNode,
  processToolResults,
  cancelConfirmNode,
  routeManagementAgent,
  routeAfterManagementToolResults,
  renderCancelNode,
} from '@/nodes/index';
import {
  lookupTripsTool,
  cancelTripTool,
  retrieveKnowledgeTool,
} from '@/tools/index';

const managementSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', managementAgentNode)
  .addNode(
    'tool_node',
    new ToolNode([lookupTripsTool, cancelTripTool, retrieveKnowledgeTool]),
  )
  .addNode('process_results', processToolResults)
  .addNode('render_cancel', renderCancelNode)
  .addNode('cancel_confirm', cancelConfirmNode, {
    ends: ['agent', 'render_cancel'],
  })

  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeManagementAgent, {
    tool_node: 'tool_node',
    cancel_confirm: 'cancel_confirm',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addConditionalEdges('process_results', routeAfterManagementToolResults, {
    cancel_confirm: 'cancel_confirm',
    render_cancel: 'render_cancel',
    agent: 'agent',
  })
  .addEdge('render_cancel', '__end__');

export const managementSubgraph = managementSubgraphWorkflow.compile();
