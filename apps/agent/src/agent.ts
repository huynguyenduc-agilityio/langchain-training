/**
 * LangGraph Agent Definition
 *
 * Constructs and compiles the LangGraph workflow.
 * This is the core graph that defines the agent's behavior.
 */

import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "./state.js";
import { chatNode, routeAfterChat } from "./nodes.js";
import { tools } from "./tools.js";

/**
 * Build the agent graph.
 *
 * Flow:
 *   __start__ → chat → (tool_calls?) → tools → chat → ... → __end__
 */
function buildGraph() {
  const toolNode = new ToolNode(tools);

  const workflow = new StateGraph(AgentState)
    .addNode("chat", chatNode)
    .addNode("tools", toolNode)
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", routeAfterChat, ["tools", "__end__"])
    .addEdge("tools", "chat");

  return workflow.compile();
}

export const graph = buildGraph();
