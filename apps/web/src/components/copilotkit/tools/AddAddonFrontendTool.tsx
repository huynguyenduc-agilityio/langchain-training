import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { useCustomers } from '@/hooks';
import type { AddonService } from '@/types';
import { useRef, useEffect } from 'react';

export function AddAddonFrontendTool() {
  const { customers, addAddon } = useCustomers();
  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useFrontendTool({
    name: 'addAddonToCustomer',
    description:
      'Add a service addon to a customer. This will enable a specific service for the customer and recalculate their monthly charges automatically.',
    parameters: z.object({
      customerID: z
        .string()
        .describe(
          "The unique customer ID (e.g., '5575-GNVDE', '7590-VHVEG')",
        ),
      addonName: z
        .string()
        .describe(
          'The name of the addon service to add. Valid options: PhoneService, MultipleLines, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies',
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

      const result = addAddon(customer.customerID, addonName as AddonService);
      if (!result) {
        return {
          success: false,
          message: `Failed to add ${addonName}. Check if prerequisites are met (e.g., PhoneService required for MultipleLines)`,
        };
      }

      return {
        success: true,
        message: `Successfully added ${addonName} to customer ${customer.customerID}`,
        newMonthlyCharges: result.MonthlyCharges,
        customer: {
          id: result.id,
          customerID: result.customerID,
          monthlyCharges: result.MonthlyCharges,
        },
      };
    },
  });

  return null;
}
