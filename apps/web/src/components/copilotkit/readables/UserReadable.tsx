'use client';

import { useAgentContext } from '@copilotkit/react-core/v2';
import { useAuth } from '@/features/auth/auth-context';

export function UserReadable() {
  const { user } = useAuth();

  useAgentContext({
    description: 'The profile information of the currently authenticated user',
    value: user ? {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
    } : null,
  });

  return null;
}
