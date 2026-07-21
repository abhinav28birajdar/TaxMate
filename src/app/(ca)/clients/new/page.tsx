'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientForm from '@/components/clients/ClientForm';

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log('Creating client:', data);
    router.push('/dashboard/clients');
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <ClientForm
        onSubmit={handleSubmit}
        title="Create New Client"
        subtitle="Add a new client to your database"
      />
    </div>
  );
}
