import { StateGraph, START, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { CustomerSupportStateAnnotation } from '../state/index';
import { chatNode, processToolResults, routeAfterChat } from '../nodes/index';
import { tools } from '../tools/index';

/**
 * Build the customer support agent graph.
 */
export function buildGraph() {
  const toolNode = new ToolNode(tools);

  const workflow = new StateGraph(CustomerSupportStateAnnotation)
    .addNode('chat_node', chatNode)
    .addNode('tool_node', toolNode)
    .addNode('process_results', processToolResults)
    .addEdge(START, 'chat_node')
    .addEdge('tool_node', 'process_results')
    .addEdge('process_results', 'chat_node')
    .addConditionalEdges('chat_node', routeAfterChat as any);

  const memory = new MemorySaver();

  return workflow.compile({
    checkpointer: memory,
  });
}
