import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { useCustomers } from '@/hooks';
import type { AddonService } from '@/types';
import { useRef, useEffect } from 'react';

export function RemoveAddonFrontendTool() {
  const { customers, removeAddon } = useCustomers();
  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useFrontendTool({
    name: 'removeAddonFromCustomer',
    description:
      'Remove a service addon from a customer. This will disable a specific service for the customer and recalculate their monthly charges automatically.',
    parameters: z.object({
      customerID: z
        .string()
        .describe(
          "The unique customer ID (e.g., '5575-GNVDE', '7590-VHVEG')",
        ),
      addonName: z
        .string()
        .describe(
          'The name of the addon service to remove. Valid options: PhoneService, MultipleLines, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies',
        ),
    }),
    handler: async ({ customerID, addonName }) => {
      const currentCustomers = customersRef.current;
      const customer = currentCustomers.find(
        (c) => c.customerID === customerID,
      );

      if (!customer) {
        return {
          success: false,
          message: `Customer with ID ${customerID} not found`,
        };
      }

      const result = removeAddon(
        customer.customerID,
        addonName as AddonService,
      );

      if (!result) {
        return {
          success: false,
          message: `Failed to remove ${addonName}`,
        };
      }

      return {
        success: true,
        message: `Successfully removed ${addonName} from customer ${customer.customerID}`,
        newMonthlyCharges: result.MonthlyCharges,
        customer: {
          id: result.customerID,
          customerID: result.customerID,
          monthlyCharges: result.MonthlyCharges,
        },
      };
    },
  });

  return null;
}
