'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { InvoiceCard } from '@/components/invoices';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices?limit=100', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load invoices');
      const rows = (json.invoices || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number || `INV-${String(inv.id).slice(0, 8)}`,
        client: inv.client_name || 'Client',
        amount: Number(inv.total_amount ?? inv.amount ?? 0),
        status: String(inv.status || 'draft').toLowerCase(),
        issueDate: inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '',
        dueDate: inv.due_date ? new Date(inv.due_date).toISOString().slice(0, 10) : '',
      }));
      setInvoices(rows);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.client.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your practice billing and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadInvoices} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link href="/ca/invoices/create">
            <Button className="gap-2 bg-lime-600 hover:bg-lime-700 text-white">
              <Plus className="w-4 h-4" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by invoice number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-lime-600" />
          <span>Loading invoices...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice: any) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                <InvoiceCard {...invoice} className="cursor-pointer hover:shadow-lg transition-shadow" />
              </Link>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <p className="text-slate-500 text-base">No matching invoices found. Create an invoice to get started.</p>
              <Link href="/ca/invoices/create">
                <Button className="mt-4 bg-lime-600 hover:bg-lime-700 text-white gap-2">
                  <Plus className="w-4 h-4" /> Create Invoice
                </Button>
              </Link>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
