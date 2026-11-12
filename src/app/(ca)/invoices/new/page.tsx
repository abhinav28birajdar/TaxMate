'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoices';
import { calculateLineItemTotals, type LineItem } from '@/components/invoices/LineItemRow';
import { toast } from 'sonner';

const defaultLineItems: LineItem[] = [
  { id: '1', description: 'Professional Services', quantity: 1, rate: 0, taxRate: 18 },
];

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/clients?take=100')
      .then((res) => (res.ok ? res.json() : { clients: [] }))
      .then((json) => {
        const list: ClientOption[] = (json.clients || []).map((c: any) => ({
          id: c.id,
          name: c.display_name || c.full_name || c.email || 'Client',
          email: c.email || '',
        }));
        setClients(list);
        if (list.length > 0) {
          setSelectedClientId(list[0].id);
        }
      })
      .catch(() => null)
      .finally(() => setLoadingClients(false));
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const handleSubmit = async (data: any, lineItems: LineItem[]) => {
    if (!selectedClientId) {
      toast.error('Please add or select a client record before creating an invoice.');
      return;
    }

    const totals = calculateLineItemTotals(lineItems);
    const subtotal = totals.subtotal;
    const taxAmount = data.taxEnabled ? totals.taxes : 0;

    if (subtotal + taxAmount <= 0) {
      toast.error('Invoice total must be greater than ₹0.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          invoiceNumber: data.invoiceNumber,
          clientName: data.client,
          clientEmail: data.clientEmail,
          description: data.description || lineItems.map((i) => i.description).filter(Boolean).join(', ') || 'Tax & Advisory Services',
          dueDate: data.dueDate,
          amount: subtotal,
          taxAmount,
          notes: data.notes,
          terms: data.terms,
          items: lineItems,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create invoice');
      }

      toast.success('Invoice created and saved!');
      router.push('/ca/payments');
    } catch (err: any) {
      toast.error(err.message || 'Could not create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Target Client Record:</span>
          {loadingClients ? (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading clients...
            </span>
          ) : clients.length === 0 ? (
            <span className="text-amber-400">No clients yet — add a client in Client Directory first</span>
          ) : (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <InvoiceForm
        key={selectedClient?.id || 'default'}
        onSubmit={handleSubmit}
        initialData={
          selectedClient
            ? {
                client: selectedClient.name,
                clientEmail: selectedClient.email,
              }
            : undefined
        }
        initialLineItems={defaultLineItems}
        isLoading={submitting}
        title="Create New Invoice"
        subtitle="Create and send GST-compliant invoices to your clients"
      />
    </div>
  );
}
