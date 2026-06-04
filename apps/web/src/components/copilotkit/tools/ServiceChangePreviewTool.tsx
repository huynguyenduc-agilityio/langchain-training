'use client';

import { useFrontendTool, useHumanInTheLoop } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { useCustomers } from '@/hooks';
import { calculateServiceChange } from '@/utils';
import type { AddonService } from '@/types';
import { useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────
// 1. Cost Preview Tool (read-only — just shows price impact)
// ─────────────────────────────────────────────────────────

/**
 * ServiceChangePreview — Frontend tool that the agent calls to show
 * a cost preview card BEFORE applying a service change.
 *
 * This is a "Generative UI" pattern: the agent triggers this tool,
 * the tool renders a rich UI card inside the chat showing the price
 * impact, and returns the calculation result so the agent can inform
 * the user.
 */
export function ServiceChangePreviewTool() {
  const { customers } = useCustomers();
  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useFrontendTool(
    {
      name: 'calculateServiceCost',
      description:
        'Calculate the cost impact of adding or removing a service for a customer. ' +
        'Use this BEFORE actually making any service changes, so the user can see the price ' +
        'impact and confirm. Returns old/new monthly charges, difference, and percentage change.',
      parameters: z.object({
        customerID: z
          .string()
          .describe("The unique customer ID (e.g., '5575-GNVDE')"),
        serviceName: z
          .string()
          .describe(
            'The service to calculate cost for. Valid options: PhoneService, MultipleLines, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, InternetService',
          ),
        action: z
          .enum(['add', 'remove'])
          .describe("Whether to 'add' or 'remove' the service"),
      }),
      handler: async ({ customerID, serviceName, action }) => {
        const customer = customersRef.current.find(
          (c) => c.customerID === customerID,
        );

        if (!customer) {
          return {
            success: false,
            message: `Customer ${customerID} not found`,
          };
        }

        const newValue = action === 'add' ? 'Yes' : 'No';
        const result = calculateServiceChange(
          customer,
          serviceName,
          newValue as 'Yes' | 'No',
        );

        return {
          success: true,
          customerID,
          serviceName,
          action,
          oldMonthly: `$${result.oldTotal.toFixed(2)}`,
          newMonthly: `$${result.newTotal.toFixed(2)}`,
          difference: `${result.difference >= 0 ? '+' : ''}$${result.difference.toFixed(2)}`,
          percentageChange: `${result.percentageChange >= 0 ? '+' : ''}${result.percentageChange.toFixed(1)}%`,
          message: `${action === 'add' ? 'Adding' : 'Removing'} ${serviceName}: $${result.oldTotal.toFixed(2)}/mo → $${result.newTotal.toFixed(2)}/mo (${result.percentageChange >= 0 ? '+' : ''}${result.percentageChange.toFixed(1)}%)`,
        };
      },
      render: (props) => {
        return <ServiceChangeCard {...props} />;
      },
    },
    [customers],
  );

  return null;
}

// ─────────────────────────────────────────────────────────
// 2. Confirm Service Change (Human-in-the-Loop)
// ─────────────────────────────────────────────────────────

/**
 * ConfirmServiceChangeTool — Agent calls this AFTER showing the cost
 * preview. Pauses execution and waits for user to Approve or Decline.
 *
 * Uses `useHumanInTheLoop` (v2) which provides a `respond` callback
 * in the render component. The agent stays paused until the user
 * clicks a button.
 */
export function ConfirmServiceChangeTool() {
  const { addAddon, removeAddon } = useCustomers();

  useHumanInTheLoop(
    {
      name: 'confirmServiceChange',
      description:
        'Ask the user to confirm or decline a service change AFTER showing them the cost preview. ' +
        'Use this after calling calculateServiceCost. Presents Approve/Decline buttons. ' +
        'Returns { approved: true/false, action, serviceName, customerID }.',
      parameters: z.object({
        customerID: z
          .string()
          .describe('The customer ID for the service change'),
        serviceName: z
          .string()
          .describe(
            'The service being changed (e.g., StreamingTV, PhoneService)',
          ),
        action: z
          .enum(['add', 'remove'])
          .describe("Whether this is an 'add' or 'remove' action"),
        costSummary: z
          .string()
          .describe(
            'A brief summary of the cost impact, e.g. "$56.95/mo → $66.19/mo (+16.2%)"',
          ),
      }),
      render: ({ args, status, respond, result }) => {
        // Streaming args in progress
        if (status === 'inProgress') {
          return (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 my-2 animate-pulse">
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Preparing confirmation...
              </div>
            </div>
          );
        }

        // Waiting for user — show Approve / Decline
        if (status === 'executing' && respond) {
          const isAdding = args.action === 'add';
          const serviceName = formatServiceName(args.serviceName || '');

          const handleApprove = () => {
            // Apply the change directly
            if (args.customerID && args.serviceName) {
              if (isAdding) {
                addAddon(args.customerID, args.serviceName as AddonService);
              } else {
                removeAddon(args.customerID, args.serviceName as AddonService);
              }
            }
            // Respond to the agent
            respond({
              approved: true,
              action: args.action,
              serviceName: args.serviceName,
              customerID: args.customerID,
            });
          };

          const handleDecline = () => {
            respond({
              approved: false,
              action: args.action,
              serviceName: args.serviceName,
              customerID: args.customerID,
            });
          };

          return (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden my-2">
              {/* Header */}
              <div
                className={`px-4 py-3 ${isAdding ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-orange-50 border-b border-orange-100'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isAdding ? '📦' : '📤'}</span>
                  <h4 className="text-sm font-bold text-gray-800">
                    Confirm Service Change
                  </h4>
                  <span
                    className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isAdding
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {isAdding ? '+ ADD' : '− REMOVE'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Service
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {serviceName}
                  </span>
                </div>

                {args.costSummary && (
                  <div className="flex items-center justify-between py-2 border-t border-b border-dashed border-gray-200">
                    <span className="text-xs text-gray-500">Cost Impact</span>
                    <span className="text-sm font-bold text-gray-800">
                      {args.costSummary}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Customer</span>
                  <span className="font-mono">{args.customerID}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold
                               bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg
                               transition-all duration-150 active:scale-[0.97]"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold
                               bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300
                               transition-all duration-150 active:scale-[0.97]"
                  >
                    ❌ Decline
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Completed — show result
        if (status === 'complete' && result) {
          const parsed = parseResult(result);
          if (!parsed) return null;

          return (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 my-2 text-sm font-medium ${
                parsed.approved
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            >
              {parsed.approved
                ? `✅ Approved — ${formatServiceName(parsed.serviceName || '')} ${parsed.action === 'add' ? 'added' : 'removed'} successfully`
                : `❌ Declined — no changes made`}
            </div>
          );
        }

        return null;
      },
    },
    [addAddon, removeAddon],
  );

  return null;
}

// ─────────────────────────────────────────────────────────
// Shared UI Components & Helpers
// ─────────────────────────────────────────────────────────

/**
 * Parse result from CopilotKit render props.
 * Result comes as a JSON string when status is "complete".
 */
function parseResult(result: string | undefined): Record<string, any> | null {
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}

/**
 * Service Change Preview Card — rendered inline in the chat (read-only).
 *
 * CopilotKit v2 render props use a discriminated union:
 * - status "inProgress": args is Partial, result is undefined
 * - status "executing": args is full, result is undefined
 * - status "complete": args is full, result is a JSON string
 */
function ServiceChangeCard(props: {
  name: string;
  toolCallId: string;
  args: Partial<{
    customerID: string;
    serviceName: string;
    action: string;
  }>;
  status: string;
  result: string | undefined;
}) {
  const { args, status, result: rawResult } = props;
  const result = parseResult(rawResult);

  // Loading state
  if (status === 'inProgress' || status === 'executing') {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 my-2 animate-pulse">
        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
          Calculating cost for {formatServiceName(args.serviceName || '...')}...
        </div>
      </div>
    );
  }

  // Error state
  if (result && !result.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 my-2">
        <p className="text-red-600 text-sm font-medium">❌ {result.message}</p>
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  const isAdding = args.action === 'add';
  const difference = result.difference || '$0.00';
  const isIncrease = difference.startsWith('+');

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden my-2">
      {/* Header */}
      <div
        className={`px-4 py-3 ${isAdding ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-orange-50 border-b border-orange-100'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{isAdding ? '📦' : '📤'}</span>
          <h4 className="text-sm font-bold text-gray-800">
            Service Change Preview
          </h4>
          <span
            className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
              isAdding
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isAdding ? '+ ADD' : '− REMOVE'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Service Name */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Service
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {formatServiceName(args.serviceName || '')}
          </span>
        </div>

        {/* Price Change */}
        <div className="flex items-center justify-between py-2 border-t border-b border-dashed border-gray-200">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Current
            </p>
            <p className="text-sm font-bold text-gray-600">
              {result.oldMonthly}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">→</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              New
            </p>
            <p className="text-sm font-bold text-gray-900">
              {result.newMonthly}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Change
            </p>
            <p
              className={`text-sm font-bold ${isIncrease ? 'text-red-600' : 'text-emerald-600'}`}
            >
              {result.difference}
            </p>
          </div>
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Monthly impact</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isIncrease
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            {result.percentageChange}
          </span>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Customer</span>
          <span className="font-mono">{args.customerID}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Format service name for display
 */
function formatServiceName(name: string): string {
  const map: Record<string, string> = {
    PhoneService: 'Phone Service',
    MultipleLines: 'Multiple Lines',
    OnlineSecurity: 'Online Security',
    OnlineBackup: 'Online Backup',
    DeviceProtection: 'Device Protection',
    TechSupport: 'Tech Support',
    StreamingTV: 'Streaming TV',
    StreamingMovies: 'Streaming Movies',
    InternetService: 'Internet Service',
  };
  return map[name] || name;
}
