export interface CopilotKitContextItem {
  name?: string;
  description?: string;
  value: string | Record<string, unknown> | null | undefined;
}

export interface StateUser {
  id?: string;
  uid?: string;
  name?: string;
  displayName?: string;
  email?: string;
}

export interface CopilotKitAction {
  name: string;
}
