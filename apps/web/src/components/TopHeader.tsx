interface TopHeaderProps {
  customers: any[];
  selectedCustomerId: string;
  onCustomerChange: (id: string) => void;
}

export function TopHeader({
  customers,
  selectedCustomerId,
  onCustomerChange,
}: TopHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Telecom Support</h1>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-600">
          Customer Account:
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[280px]"
        >
          <option value="">Select Customer Account</option>
          {customers.map((customer: any) => (
            <option key={customer.id} value={customer.customerID}>
              {customer.customerID} - {customer.gender} ({customer.tenure}{' '}
              months)
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
