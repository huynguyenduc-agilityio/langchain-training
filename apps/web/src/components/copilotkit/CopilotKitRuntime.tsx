import type { ReactNode } from 'react';
import { CopilotKit } from '@copilotkit/react-core/v2';
import { Suspense } from 'react';

import { API_ROUTES } from '@/constants';

function CopilotKitRuntime({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl={API_ROUTES.COPILOTKIT} useSingleEndpoint={false}>
      <Suspense fallback={null}>{children}</Suspense>
    </CopilotKit>
  );
}

export default CopilotKitRuntime;
