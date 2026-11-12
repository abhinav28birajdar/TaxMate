'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientForm from '@/components/clients/ClientForm';
import { toast } from 'sonner';

export default function NewClientPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: data.name,
          displayName: data.name,
          email: data.email,
          phone: data.phone,
          pan: data.panNumber || undefined,
          gstin: data.gstNumber || undefined,
          clientType: data.clientType || 'individual',
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          notes: data.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create client');
      }
      toast.success('Client created successfully!');
      router.push('/ca/clients');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to create client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <ClientForm
        onSubmit={handleSubmit}
        isLoading={submitting}
        title="Create New Client"
        subtitle="Add a new client to your Supabase practice roster"
      />
    </div>
  );
}
