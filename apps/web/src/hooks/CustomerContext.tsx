"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { calculateMonthlyCharges } from "@/utils";
import { initialCustomers } from "@/lib/data/ticketsData";

// Re-export types from canonical source
export type { Customer, NewCustomerInput, AddonService } from "@/types";
import type { Customer, NewCustomerInput, AddonService } from "@/types";

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customerData: NewCustomerInput) => Customer;
  deleteCustomer: (customerId: number) => boolean;
  updateCustomer: (
    customerId: number,
    updates: Partial<Customer>,
  ) => Customer | null;
  addAddon: (customerId: string, addon: AddonService) => Customer | null;
  removeAddon: (customerId: string, addon: AddonService) => Customer | null;
  getCustomerById: (customerId: number) => Customer | undefined;
  getCustomerByCustomerId: (customerID: string) => Customer | undefined;
  recalculateCharges: (customer: Customer) => {
    monthlyCharges: number;
    totalCharges: number;
  };
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined,
);

function generateCustomerID(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const letters = Array.from({ length: 5 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
  return `${digits}-${letters}`;
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  // Local state as the single source of truth for customers
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // Keep a ref to always have the latest customers in closures
  const customersRef = useRef<Customer[]>([]);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  const recalculateCharges = useCallback((customer: Customer) => {
    const calculation = calculateMonthlyCharges(customer);
    const monthlyCharges = calculation.total;
    const tenure = parseInt(customer.tenure) || 0;
    const totalCharges = monthlyCharges * tenure;

    return { monthlyCharges, totalCharges };
  }, []);

  const addCustomer = useCallback(
    (customerData: NewCustomerInput): Customer => {
      const newId =
        customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1;

      // Handle MultipleLines based on PhoneService
      const multipleLines =
        customerData.MultipleLines ||
        (customerData.PhoneService === "No" ? "No phone service" : "No");

      // Create customer with temporary charges
      const tempCustomer: Customer = {
        ...customerData,
        id: newId,
        customerID: generateCustomerID(),
        SeniorCitizen: "0",
        MultipleLines: multipleLines,
        Contract: "Month-to-month",
        MonthlyCharges: "0",
        TotalCharges: "0",
        Churn: "No",
        status: "new",
      };

      // Calculate actual charges
      const { monthlyCharges, totalCharges } = recalculateCharges(tempCustomer);

      const newCustomer: Customer = {
        ...tempCustomer,
        MonthlyCharges: monthlyCharges.toFixed(2),
        TotalCharges: totalCharges.toFixed(2),
      };

      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      return newCustomer;
    },
    [customers, recalculateCharges],
  );

  const deleteCustomer = useCallback(
    (customerId: number): boolean => {
      const initialLength = customers.length;
      const updatedCustomers = customers.filter((c) => c.id !== customerId);
      setCustomers(updatedCustomers);
      return initialLength !== updatedCustomers.length;
    },
    [customers],
  );

  const updateCustomer = useCallback(
    (customerId: number, updates: Partial<Customer>): Customer | null => {
      let updatedCustomer: Customer | null = null;

      const updatedCustomers = customers.map((customer) => {
        if (customer.id === customerId) {
          const updated = { ...customer, ...updates };

          // Handle MultipleLines dependency on PhoneService
          if (updates.PhoneService === "No") {
            updated.MultipleLines = "No phone service";
          } else if (
            updates.PhoneService === "Yes" &&
            updated.MultipleLines === "No phone service"
          ) {
            updated.MultipleLines = "No";
          }

          // Recalculate charges if any service changed
          const { monthlyCharges, totalCharges } = recalculateCharges(updated);
          updated.MonthlyCharges = monthlyCharges.toFixed(2);
          updated.TotalCharges = totalCharges.toFixed(2);

          updatedCustomer = updated;
          return updated;
        }
        return customer;
      });

      setCustomers(updatedCustomers);
      return updatedCustomer;
    },
    [customers, recalculateCharges],
  );

  const addAddon = useCallback(
    (customerId: string, addon: AddonService): Customer | null => {
      let updatedCustomer: Customer | null = null;
      const updatedCustomers = customersRef.current.map((customer) => {
        if (customer.customerID === customerId) {
          const updates: Partial<Customer> = {};

          // Handle PhoneService and MultipleLines special case
          if (addon === "PhoneService") {
            updates.PhoneService = "Yes";
            if (customer.MultipleLines === "No phone service") {
              updates.MultipleLines = "No";
            }
          } else if (addon === "MultipleLines") {
            if (customer.PhoneService === "No") {
              return customer;
            }
            updates.MultipleLines = "Yes";
          } else {
            updates[addon] = "Yes";
          }
          const updated = { ...customer, ...updates };

          // Recalculate charges
          const { monthlyCharges, totalCharges } = recalculateCharges(updated);
          updated.MonthlyCharges = monthlyCharges.toFixed(2);
          updated.TotalCharges = totalCharges.toFixed(2);

          updatedCustomer = updated;
          return updated;
        }
        return customer;
      });

      if (updatedCustomer) {
        setCustomers(updatedCustomers);
      } else {
        console.warn(
          `[CustomerContext] Failed to update. Customer ID ${customerId} not found in state.`,
        );
      }

      return updatedCustomer;
    },
    [customers, recalculateCharges],
  );

  const removeAddon = (
    customerId: string,
    addon: AddonService,
  ): Customer | null => {
    let updatedCustomer: Customer | null = null;

    const updatedCustomers = customersRef.current.map((customer) => {
      if (customer.customerID === customerId) {
        const updates: Partial<Customer> = {};

        // Handle PhoneService and MultipleLines special case
        if (addon === "PhoneService") {
          updates.PhoneService = "No";
          updates.MultipleLines = "No phone service";
        } else if (addon === "MultipleLines") {
          updates.MultipleLines = "No";
        } else {
          updates[addon] = "No";
        }

        const updated = { ...customer, ...updates };

        // Recalculate charges
        const { monthlyCharges, totalCharges } = recalculateCharges(updated);
        updated.MonthlyCharges = monthlyCharges.toFixed(2);
        updated.TotalCharges = totalCharges.toFixed(2);

        updatedCustomer = updated;
        return updated;
      }
      return customer;
    });

    if (updatedCustomer) {
      setCustomers(updatedCustomers);
    }

    return updatedCustomer;
  };

  const getCustomerById = useCallback(
    (customerId: number): Customer | undefined => {
      return customers.find((c) => c.id === customerId);
    },
    [customers],
  );

  const getCustomerByCustomerId = useCallback(
    (customerID: string): Customer | undefined => {
      return customers.find((c) => c.customerID === customerID);
    },
    [customers],
  );

  const value: CustomerContextType = {
    customers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    addAddon,
    removeAddon,
    getCustomerById,
    getCustomerByCustomerId,
    recalculateCharges,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
