import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { THREAD_ID_KEY } from '@/constants';

type AgentState = {
  threadId: string;
  setThreadId: (id: string) => void;
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      threadId: '',
      setThreadId: (threadId) => set({ threadId }),
    }),
    {
      name: THREAD_ID_KEY,
    },
  ),
);
