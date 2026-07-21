'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoices';

const defaultLineItems = [
  { id: '1', description: 'Professional Services', quantity: 1, rate: 0, taxRate: 18 },
];

export default function NewInvoicePage() {
  const router = useRouter();

  const handleSubmit = async (data: any, lineItems: any[]) => {
    console.log('Creating invoice:', data, lineItems);
    router.push('/dashboard/invoices');
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <InvoiceForm
        onSubmit={handleSubmit}
        initialLineItems={defaultLineItems}
        title="Create New Invoice"
        subtitle="Create and send invoices to your clients"
      />
    </div>
  );
}
