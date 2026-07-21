'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const mockClient = {
  id: '1',
  name: 'ABC Corporation',
  email: 'contact@abc.com',
  phone: '9876543210',
  status: 'active',
  panNumber: 'AAAPA0001A',
  gstNumber: 'GST123',
  industry: 'Technology',
  address: '123 Tech Street, Bangalore',
  city: 'Bangalore',
  state: 'Karnataka',
  taxFilings: 8,
  activeInvoices: 3,
  documents: 12,
};

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client] = useState(mockClient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
            <Badge className="mt-2 bg-green-100 text-green-700">{client.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-600">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Mail className="w-4 h-4" /> Email
          </div>
          <p className="font-semibold text-slate-900">{client.email}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Phone className="w-4 h-4" /> Phone
          </div>
          <p className="font-semibold text-slate-900">{client.phone}</p>
        </Card>
        <Card className="p-4">
          <div className="text-slate-600 mb-2 font-medium">PAN</div>
          <p className="font-semibold text-slate-900">{client.panNumber}</p>
        </Card>
        <Card className="p-4">
          <div className="text-slate-600 mb-2 font-medium">GST</div>
          <p className="font-semibold text-slate-900">{client.gstNumber}</p>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-600">{client.taxFilings}</div>
          <p className="text-slate-600 mt-1">Tax Filings</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-600">{client.activeInvoices}</div>
          <p className="text-slate-600 mt-1">Active Invoices</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-600">{client.documents}</div>
          <p className="text-slate-600 mt-1">Documents</p>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link href={`/dashboard/invoices?client=${client.id}`}>
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> View Invoices
          </Button>
        </Link>
        <Link href={`/dashboard/tasks?assignee=${client.id}`}>
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> View Tasks
          </Button>
        </Link>
        <Link href={`/dashboard/compliance?client=${client.id}`}>
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> Compliance
          </Button>
        </Link>
        <Link href={`/dashboard/documents?client=${client.id}`}>
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> Documents
          </Button>
        </Link>
      </div>

      {/* Address */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Address</h2>
        <p className="text-slate-700">{client.address}</p>
        <p className="text-slate-700">{client.city}, {client.state}</p>
      </Card>
    </div>
  );
}
