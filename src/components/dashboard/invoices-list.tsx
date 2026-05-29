'use client';

import { Invoice } from '@lib/types/complete.types';

interface InvoicesListProps {
  invoices: Invoice[];
  loading: boolean;
}

export default function InvoicesList({ invoices, loading }: InvoicesListProps) {
  if (loading) {
    return <div className="text-center py-10">Loading invoices...</div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-500">No invoices found. Create your first invoice!</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{invoice.client_id}</span>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">₹{invoice.total_amount}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-700">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
