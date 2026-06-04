import { CopilotKit } from '@copilotkit/react-core/v2';
import { Suspense, type ReactNode } from 'react';

function CopilotKitRuntime({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <Suspense fallback={null}>{children}</Suspense>
    </CopilotKit>
  );
}

export default CopilotKitRuntime;
