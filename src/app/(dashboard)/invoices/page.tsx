// Invoices Page
'use client';

import { useEffect, useState } from 'react';
import InvoicesList from '@/components/dashboard/invoices-list';
import CreateInvoiceModal from '@/components/dashboard/create-invoice-modal';
import { Invoice } from '@/lib/types/complete.types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/invoices?${params.toString()}`);
      const result = await response.json();
      setInvoices(result.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        await fetchInvoices();
        setShowCreate(false);
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your billing and payments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create Invoice
        </button>
      </div>

      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateInvoice}
        />
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="mt-1 block px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <InvoicesList invoices={invoices} loading={loading} />
    </div>
  );
}
