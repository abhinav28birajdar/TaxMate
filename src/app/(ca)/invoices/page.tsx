'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
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

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices] = useState([
    { id: '1', invoiceNumber: 'INV-202607-0001', client: 'ABC Corp', amount: 50000, status: 'sent', issueDate: '2026-07-04', dueDate: '2026-08-04' },
    { id: '2', invoiceNumber: 'INV-202607-0002', client: 'XYZ Ltd', amount: 75000, status: 'paid', issueDate: '2026-07-03', dueDate: '2026-08-03' },
    { id: '3', invoiceNumber: 'INV-202606-0012', client: 'Tech Corp', amount: 45000, status: 'overdue', issueDate: '2026-06-04', dueDate: '2026-07-04' },
  ]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.includes(searchTerm) || inv.client.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Manage your billing and payments</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2 bg-lime-600 hover:bg-lime-700">
            <Plus className="w-4 h-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
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
          <SelectTrigger className="w-40">
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

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice: any) => (
            <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
              <InvoiceCard {...invoice} className="cursor-pointer hover:shadow-lg transition-shadow" />
            </Link>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <p className="text-slate-500 text-lg">No invoices found. Create your first invoice to get started.</p>
            <Link href="/dashboard/invoices/new">
              <Button className="mt-4 bg-lime-600 hover:bg-lime-700 gap-2">
                <Plus className="w-4 h-4" /> Create Invoice
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
