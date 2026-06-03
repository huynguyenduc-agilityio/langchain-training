/**
 * Agent State Definition
 *
 * Defines the state schema (annotations) used by the LangGraph workflow.
 * All nodes in the graph read from and write to this shared state.
 */

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

/**
 * AgentState extends the base MessagesAnnotation with custom fields.
 * Add your own state properties here as needed.
 */
export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
});

export type AgentStateType = typeof AgentState.State;
