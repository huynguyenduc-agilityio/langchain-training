'use client';

import { useState } from 'react';
import {
  CopilotSidebar,
  useConfigureSuggestions,
} from '@copilotkit/react-core/v2';
import { CustomerProvider, useCustomers } from '@/hooks';
import { TopHeader } from '@/components/TopHeader';
import { CustomerCard } from '@/components/CustomerCard';
import { CustomerHealthCard } from '@/components/CustomerHealthCard';
import CopilotKitTools from '@/components/copilotkit/CopilotKitTools';

export default function CustomerSupportPage() {
  return (
    <CustomerProvider>
      <CopilotKitTools />
      <div className="flex h-screen overflow-hidden">
        <MainContent />
        <SidebarWithSuggestions />
      </div>
    </CustomerProvider>
  );
}

function SidebarWithSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: 'Check my services',
        message:
          'Hi, I want to know about my services for customer ID: 5575-GNVDE',
      },
      {
        title: 'Report an outage',
        message:
          'My internet has been down for 2 hours! Customer ID: 7590-VHVEG',
      },
    ],
  });

  return (
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        modalHeaderTitle: 'Telecom Support Assistant',
        welcomeMessageText:
          "Hi! 👋 I'm here to assist you with your telecom support needs. I can help you manage your account, troubleshoot issues, or provide information about your services.",
      }}
    />
  );
}

function MainContent() {
  const {
    customers,
    getCustomerByCustomerId,
    addAddon,
    removeAddon,
    updateCustomer,
  } = useCustomers();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const selectedCustomer = selectedCustomerId
    ? getCustomerByCustomerId(selectedCustomerId)
    : null;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <TopHeader
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onCustomerChange={setSelectedCustomerId}
      />

      <div className="flex-1 overflow-auto p-6">
        <CustomerCard
          customer={selectedCustomer}
          addAddon={addAddon}
          removeAddon={removeAddon}
          updateCustomer={updateCustomer}
        />

        {/* Customer Health Card — shows risk/health score */}
        {selectedCustomer && (
          <div className="max-w-5xl mx-auto mt-6">
            <CustomerHealthCard customer={selectedCustomer} />
          </div>
        )}
      </div>
    </div>
  );
}

