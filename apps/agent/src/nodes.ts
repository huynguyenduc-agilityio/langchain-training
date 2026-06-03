/**
 * Graph Node Definitions
 *
 * Contains the node functions that make up the LangGraph workflow.
 * Each node receives the current state and returns a partial state update.
 */

import { ChatOpenAI } from "@langchain/openai";
import { AgentState, type AgentStateType } from "./state.js";
import { tools } from "./tools.js";

/**
 * Create the LLM instance with tool binding.
 */
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

/**
 * Chat node — invokes the LLM with the current message history.
 */
export async function chatNode(state: AgentStateType) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

/**
 * Router — determines the next step based on the LLM response.
 * If the LLM made tool calls, route to the tools node; otherwise, end.
 */
export function routeAfterChat(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return "__end__";
}
