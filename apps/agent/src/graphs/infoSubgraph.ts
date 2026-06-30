import { StateGraph, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { RideBookingStateAnnotation } from '@/state/index';
import {
  infoAgentNode,
  processToolResults,
  routeAfterChat,
  routeAfterInfoToolResults,
  routeAfterGrading,
  retrievalGraderNode,
  queryRewriterNode,
} from '@/nodes/info';
import { lookupTripsTool, retrieveKnowledgeTool } from '@/tools/index';

const infoSubgraphWorkflow = new StateGraph(RideBookingStateAnnotation)
  .addNode('agent', infoAgentNode)
  .addNode('tool_node', new ToolNode([lookupTripsTool, retrieveKnowledgeTool]))
  .addNode('process_results', processToolResults)
  .addNode('retrieval_grader', retrievalGraderNode)
  .addNode('query_rewriter', queryRewriterNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeAfterChat, {
    tool_node: 'tool_node',
    __end__: '__end__',
  })
  .addEdge('tool_node', 'process_results')
  .addConditionalEdges('process_results', routeAfterInfoToolResults, {
    retrieval_grader: 'retrieval_grader',
    agent: 'agent',
    __end__: '__end__',
  })
  .addConditionalEdges('retrieval_grader', routeAfterGrading, {
    agent: 'agent',
    query_rewriter: 'query_rewriter',
  })
  .addEdge('query_rewriter', 'agent');

export const infoSubgraph = infoSubgraphWorkflow.compile();
