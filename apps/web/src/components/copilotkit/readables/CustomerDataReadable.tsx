import { useAgentContext } from '@copilotkit/react-core/v2';
import { useCustomers } from '@/hooks';

export function CustomerDataReadable() {
  const { customers } = useCustomers();

  useAgentContext({
    description:
      'Current customer records for the telecom support system. Contains all customer data including services, billing, and account details.',
    value: JSON.parse(JSON.stringify(customers)),
  });

  return null;
}
