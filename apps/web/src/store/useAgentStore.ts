import { create } from 'zustand';
import { getPersistedThreadId } from '@/utils';

type AgentState = {
  threadId: string;
  setThreadId: (id: string) => void;
};

export const useAgentStore = create<AgentState>((set) => ({
  threadId: getPersistedThreadId(),
  setThreadId: (id) => set({ threadId: id }),
}));
