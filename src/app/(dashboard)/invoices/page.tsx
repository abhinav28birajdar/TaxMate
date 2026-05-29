// Invoices Page
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useRealtimeInvoices } from '@/hooks/use-realtime';
import InvoicesList from '@/components/dashboard/invoices-list';
import CreateInvoiceModal from '@/components/dashboard/create-invoice-modal';
import { Invoice } from '@lib/types/complete.types';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const result = await response.json();
      setInvoices(result.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError('Failed to load invoices. Please try again.');
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useRealtimeInvoices(
    user?.id || '',
    useCallback((newInvoice) => {
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('New invoice created');
    }, []),
    useCallback((updatedInvoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
      toast.success('Invoice updated');
    }, []),
    useCallback((deletedInvoice) => {
      setInvoices(prev => prev.filter(inv => inv.id !== deletedInvoice.id));
      toast.success('Invoice deleted');
    }, [])
  );

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        toast.success('Invoice created successfully');
        setShowCreate(false);
        // No need to refetch - real-time will update
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="mt-1 block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
