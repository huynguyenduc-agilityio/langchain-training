/**
 * Shared customer types used across the application.
 */

export interface Customer {
  id: number;
  customerID: string;
  gender: string;
  SeniorCitizen: "0";
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: string;
  PhoneService: "Yes" | "No";
  MultipleLines: "Yes" | "No" | "No phone service";
  InternetService: "DSL" | "Fiber optic";
  OnlineSecurity: "Yes" | "No";
  OnlineBackup: "Yes" | "No";
  DeviceProtection: "Yes" | "No";
  TechSupport: "Yes" | "No";
  StreamingTV: "Yes" | "No";
  StreamingMovies: "Yes" | "No";
  Contract: "Month-to-month";
  PaperlessBilling: "Yes" | "No";
  PaymentMethod:
    | "Electronic check"
    | "Mailed check"
    | "Bank transfer (automatic)"
    | "Credit card (automatic)";
  MonthlyCharges: string;
  TotalCharges: string;
  Churn: "No" | "Yes";
  status: "new" | "active" | "resolved" | "escalated";
}

export interface NewCustomerInput {
  gender: string;
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: string;
  PhoneService: "Yes" | "No";
  MultipleLines?: "Yes" | "No" | "No phone service";
  InternetService: "DSL" | "Fiber optic";
  OnlineSecurity: "Yes" | "No";
  OnlineBackup: "Yes" | "No";
  DeviceProtection: "Yes" | "No";
  TechSupport: "Yes" | "No";
  StreamingTV: "Yes" | "No";
  StreamingMovies: "Yes" | "No";
  PaperlessBilling: "Yes" | "No";
  PaymentMethod:
    | "Electronic check"
    | "Mailed check"
    | "Bank transfer (automatic)"
    | "Credit card (automatic)";
}

export type AddonService =
  | "PhoneService"
  | "MultipleLines"
  | "OnlineSecurity"
  | "OnlineBackup"
  | "DeviceProtection"
  | "TechSupport"
  | "StreamingTV"
  | "StreamingMovies";
