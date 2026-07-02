import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { THREAD_ID_KEY } from '@/constants';

type AgentState = {
  threadId: string;
  setThreadId: (id: string) => void;
  activeResolve: ((value: any) => void) | null;
  setActiveResolve: (resolve: ((value: any) => void) | null) => void;
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      threadId: '',
      setThreadId: (threadId) => set({ threadId }),
      activeResolve: null,
      setActiveResolve: (activeResolve) => set({ activeResolve }),
    }),
    {
      name: THREAD_ID_KEY,
      partialize: (state) => ({ threadId: state.threadId }),
    },
  ),
);
