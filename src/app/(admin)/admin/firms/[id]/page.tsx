"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, ShieldCheck, Users, HardDrive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminFirmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const firm = {
    id: params.id,
    name: 'Sharma & Associates Chartered Accountants',
    slug: 'sharma-associates',
    gstin: '27AABCU9603R1ZM',
    plan: 'Pro Plan',
    seatsUsed: '8 / 15',
    storageUsed: '42 GB / 100 GB',
    status: 'active'
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{firm.name}</h1>
            <p className="text-sm text-slate-400">Firm Slug: {firm.slug}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {firm.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs block">Active Plan</span>
            <span className="font-bold text-lime-400 text-base">{firm.plan}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs block">Staff Seats</span>
            <span className="font-bold text-slate-100 text-base">{firm.seatsUsed}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs block">Document Storage</span>
            <span className="font-bold text-slate-100 text-base">{firm.storageUsed}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
