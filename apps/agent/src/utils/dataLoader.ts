/**
 * Data Loader Utility
 *
 * Provides customer data lookup functions for the agent tools.
 * Data is embedded directly to avoid file-system dependencies
 * in the LangGraph runtime environment.
 */

import { CustomerData } from '../state/index';

/**
 * Embedded customer dataset (same data as the frontend ticketsData)
 */
const CUSTOMER_DATA: CustomerData[] = [
  {
    id: 1,
    customerID: '7590-VHVEG',
    gender: 'Female',
    SeniorCitizen: '0',
    Partner: 'Yes',
    Dependents: 'No',
    tenure: '1',
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: '29.85',
    TotalCharges: '29.85',
    Churn: 'No',
    status: 'new',
  },
  {
    id: 2,
    customerID: '5575-GNVDE',
    gender: 'Male',
    SeniorCitizen: '0',
    Partner: 'No',
    Dependents: 'No',
    tenure: '34',
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'DSL',
    OnlineSecurity: 'Yes',
    OnlineBackup: 'No',
    DeviceProtection: 'Yes',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'No',
    PaymentMethod: 'Mailed check',
    MonthlyCharges: '56.95',
    TotalCharges: '1889.5',
    Churn: 'No',
    status: 'new',
  },
  {
    id: 3,
    customerID: '3668-QPYBK',
    gender: 'Male',
    SeniorCitizen: '0',
    Partner: 'No',
    Dependents: 'No',
    tenure: '2',
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'DSL',
    OnlineSecurity: 'Yes',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Mailed check',
    MonthlyCharges: '53.85',
    TotalCharges: '108.15',
    Churn: 'Yes',
    status: 'new',
  },
  {
    id: 4,
    customerID: '7795-CFOCW',
    gender: 'Male',
    SeniorCitizen: '0',
    Partner: 'No',
    Dependents: 'No',
    tenure: '45',
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'Yes',
    OnlineBackup: 'No',
    DeviceProtection: 'Yes',
    TechSupport: 'Yes',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'No',
    PaymentMethod: 'Bank transfer (automatic)',
    MonthlyCharges: '42.30',
    TotalCharges: '1840.75',
    Churn: 'No',
    status: 'new',
  },
  {
    id: 5,
    customerID: '9237-HQITU',
    gender: 'Female',
    SeniorCitizen: '0',
    Partner: 'Yes',
    Dependents: 'Yes',
    tenure: '2',
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: '70.70',
    TotalCharges: '151.65',
    Churn: 'Yes',
    status: 'new',
  },
  {
    id: 6,
    customerID: '9305-CDSKC',
    gender: 'Female',
    SeniorCitizen: '0',
    Partner: 'Yes',
    Dependents: 'Yes',
    tenure: '8',
    PhoneService: 'Yes',
    MultipleLines: 'Yes',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'Yes',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    StreamingMovies: 'Yes',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: '99.65',
    TotalCharges: '820.5',
    Churn: 'Yes',
    status: 'new',
  },
  {
    id: 7,
    customerID: '1452-KIOVK',
    gender: 'Male',
    SeniorCitizen: '0',
    Partner: 'No',
    Dependents: 'Yes',
    tenure: '22',
    PhoneService: 'Yes',
    MultipleLines: 'Yes',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Credit card (automatic)',
    MonthlyCharges: '89.10',
    TotalCharges: '1949.4',
    Churn: 'No',
    status: 'new',
  },
  {
    id: 8,
    customerID: '6713-OKOMC',
    gender: 'Female',
    SeniorCitizen: '0',
    Partner: 'No',
    Dependents: 'No',
    tenure: '10',
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'Yes',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'No',
    PaymentMethod: 'Mailed check',
    MonthlyCharges: '29.75',
    TotalCharges: '301.9',
    Churn: 'No',
    status: 'new',
  },
];

/**
 * Load all customer data
 */
export function loadTicketsData(): CustomerData[] {
  return CUSTOMER_DATA;
}

/**
 * Find customer by customer ID
 */
export function findCustomerById(customerId: string): CustomerData | null {
  const customer = CUSTOMER_DATA.find(
    (ticket) => ticket.customerID === customerId,
  );
  return customer || null;
}

/**
 * Find customers by partial match (for search)
 */
export function searchCustomers(query: string): CustomerData[] {
  const lowerQuery = query.toLowerCase();

  return CUSTOMER_DATA.filter((ticket) => {
    return (
      ticket.customerID?.toLowerCase().includes(lowerQuery) ||
      ticket.gender?.toLowerCase().includes(lowerQuery) ||
      ticket.InternetService?.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Get customer statistics for context
 */
export function getCustomerContext(customer: CustomerData): string {
  return `Customer Profile:
- Customer ID: ${customer.customerID}
- Tenure: ${customer.tenure} months
- Services: ${customer.InternetService} Internet, ${customer.PhoneService} Phone
- Contract: ${customer.Contract}
- Monthly Charges: $${customer.MonthlyCharges}
- Payment Method: ${customer.PaymentMethod}
- Churn Risk: ${customer.Churn === 'Yes' ? '⚠️ HIGH' : '✓ Low'}
- Senior Citizen: ${customer.SeniorCitizen === '1' ? 'Yes' : 'No'}`;
}
