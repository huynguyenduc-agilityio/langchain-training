import { useFrontendTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { useCustomers } from '@/hooks';
import type { Customer } from '@/types';
import { useRef, useEffect } from 'react';

export function UpdateSettingsFrontendTool() {
  const { customers, updateCustomer } = useCustomers();
  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useFrontendTool({
    name: 'updateCustomerSettings',
    description:
      'Update customer settings such as Internet Service (switch between DSL and Fiber optic), Paperless Billing, or Partner status. This will recalculate monthly charges automatically.',
    parameters: z.object({
      customerID: z
        .string()
        .describe(
          "The unique customer ID (e.g., '5575-GNVDE', '7590-VHVEG')",
        ),
      setting: z
        .string()
        .describe(
          "The setting to update. Valid options: 'InternetService', 'PaperlessBilling', 'Partner'",
        ),
      value: z
        .string()
        .describe(
          "The new value for the setting. For InternetService: 'DSL' or 'Fiber optic'. For PaperlessBilling/Partner: 'Yes' or 'No'",
        ),
    }),
    handler: async ({ customerID, setting, value }) => {
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

      // Validate setting and value
      const validSettings = ['InternetService', 'PaperlessBilling', 'Partner'];
      if (!validSettings.includes(setting)) {
        return {
          success: false,
          message: `Invalid setting: ${setting}. Valid options: ${validSettings.join(', ')}`,
        };
      }

      // Normalize value to handle case variations
      let normalizedValue = value;
      if (setting === 'InternetService') {
        const lower = value.toLowerCase().trim();
        if (lower === 'fiber optic') normalizedValue = 'Fiber optic';
        else if (lower === 'dsl') normalizedValue = 'DSL';
      }

      if (setting === 'InternetService') {
        if (normalizedValue !== 'DSL' && normalizedValue !== 'Fiber optic') {
          return {
            success: false,
            message: `Invalid value for InternetService: ${value}. Must be 'DSL' or 'Fiber optic'`,
          };
        }
      } else if (setting === 'PaperlessBilling' || setting === 'Partner') {
        const lower = value.toLowerCase().trim();
        if (lower === 'yes') normalizedValue = 'Yes';
        else if (lower === 'no') normalizedValue = 'No';
        else {
          return {
            success: false,
            message: `Invalid value for ${setting}: ${value}. Must be 'Yes' or 'No'`,
          };
        }
      }

      const updates: Partial<Customer> = {
        [setting]: normalizedValue as any,
      };

      const result = updateCustomer(customer.id, updates);

      if (!result) {
        return {
          success: false,
          message: `Failed to update ${setting} for customer ${customerID}`,
        };
      }

      return {
        success: true,
        message: `Successfully updated ${setting} to '${value}' for customer ${customer.customerID}`,
        newMonthlyCharges: result.MonthlyCharges,
        customer: {
          id: result.id,
          customerID: result.customerID,
          monthlyCharges: result.MonthlyCharges,
          [setting]: result[setting as keyof Customer],
        },
      };
    },
  });

  return null;
}
