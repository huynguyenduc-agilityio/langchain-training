'use client';

import type { Customer } from '@/types';

/**
 * Health score calculation factors and weights
 */
function calculateHealthScore(customer: Customer): {
  score: number;
  factors: { label: string; value: string; impact: 'positive' | 'negative' | 'neutral' }[];
} {
  let score = 50; // Start at 50
  const factors: { label: string; value: string; impact: 'positive' | 'negative' | 'neutral' }[] = [];

  // Tenure (max +25 points)
  const tenure = parseInt(customer.tenure) || 0;
  if (tenure >= 48) {
    score += 25;
    factors.push({ label: 'Tenure', value: `${tenure} months`, impact: 'positive' });
  } else if (tenure >= 24) {
    score += 15;
    factors.push({ label: 'Tenure', value: `${tenure} months`, impact: 'positive' });
  } else if (tenure >= 12) {
    score += 5;
    factors.push({ label: 'Tenure', value: `${tenure} months`, impact: 'neutral' });
  } else {
    score -= 10;
    factors.push({ label: 'Tenure', value: `${tenure} months`, impact: 'negative' });
  }

  // Churn risk (critical factor)
  if (customer.Churn === 'Yes') {
    score -= 30;
    factors.push({ label: 'Churn Risk', value: 'At Risk', impact: 'negative' });
  } else {
    score += 10;
    factors.push({ label: 'Churn Risk', value: 'Stable', impact: 'positive' });
  }

  // Contract type
  if (customer.Contract === 'Month-to-month') {
    score -= 5;
    factors.push({ label: 'Contract', value: 'Month-to-month', impact: 'negative' });
  } else {
    score += 10;
    factors.push({ label: 'Contract', value: customer.Contract, impact: 'positive' });
  }

  // Number of services (engagement indicator)
  const services = [
    customer.PhoneService,
    customer.OnlineSecurity,
    customer.OnlineBackup,
    customer.DeviceProtection,
    customer.TechSupport,
    customer.StreamingTV,
    customer.StreamingMovies,
  ].filter((s) => s === 'Yes').length;

  if (services >= 4) {
    score += 15;
    factors.push({ label: 'Active Services', value: `${services}`, impact: 'positive' });
  } else if (services >= 2) {
    score += 5;
    factors.push({ label: 'Active Services', value: `${services}`, impact: 'neutral' });
  } else {
    score -= 5;
    factors.push({ label: 'Active Services', value: `${services}`, impact: 'negative' });
  }

  // Monthly charges (revenue)
  const charges = parseFloat(customer.MonthlyCharges) || 0;
  if (charges >= 80) {
    score += 5;
    factors.push({ label: 'Revenue', value: `$${charges.toFixed(0)}/mo`, impact: 'positive' });
  } else if (charges >= 50) {
    factors.push({ label: 'Revenue', value: `$${charges.toFixed(0)}/mo`, impact: 'neutral' });
  } else {
    factors.push({ label: 'Revenue', value: `$${charges.toFixed(0)}/mo`, impact: 'negative' });
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, factors };
}

/**
 * Get score color and label
 */
function getScoreConfig(score: number) {
  if (score >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-500', barBg: 'bg-emerald-100', label: 'Excellent', emoji: '🟢' };
  if (score >= 60) return { color: 'text-blue-600', bg: 'bg-blue-500', barBg: 'bg-blue-100', label: 'Good', emoji: '🔵' };
  if (score >= 40) return { color: 'text-amber-600', bg: 'bg-amber-500', barBg: 'bg-amber-100', label: 'Fair', emoji: '🟡' };
  if (score >= 20) return { color: 'text-orange-600', bg: 'bg-orange-500', barBg: 'bg-orange-100', label: 'At Risk', emoji: '🟠' };
  return { color: 'text-red-600', bg: 'bg-red-500', barBg: 'bg-red-100', label: 'Critical', emoji: '🔴' };
}

interface CustomerHealthCardProps {
  customer: Customer;
}

/**
 * CustomerHealthCard — Displays a customer health/risk score
 * based on tenure, churn status, services, and revenue.
 *
 * This is a pure frontend component — no agent interaction needed.
 * All data comes from the existing customer state.
 */
export function CustomerHealthCard({ customer }: CustomerHealthCardProps) {
  const { score, factors } = calculateHealthScore(customer);
  const config = getScoreConfig(score);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Customer Health</h3>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              customer.Churn === 'Yes'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {customer.Churn === 'Yes' ? '⚠️ Churn Risk' : '✅ Stable'}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Score Circle */}
          <div className="relative flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                className={`${config.color} transition-all duration-700 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-extrabold ${config.color}`}>
                {score}
              </span>
            </div>
          </div>

          {/* Score Info */}
          <div>
            <p className={`text-lg font-bold ${config.color}`}>
              {config.emoji} {config.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Health Score out of 100
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 ${config.barBg} rounded-full overflow-hidden mb-5`}>
          <div
            className={`h-full ${config.bg} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Factors */}
        <div className="space-y-2">
          {factors.map((factor, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{factor.label}</span>
              <span
                className={`font-medium ${
                  factor.impact === 'positive'
                    ? 'text-emerald-600'
                    : factor.impact === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {factor.impact === 'positive' && '↑ '}
                {factor.impact === 'negative' && '↓ '}
                {factor.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
