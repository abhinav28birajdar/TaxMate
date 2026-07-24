"use client";

import React from 'react';
import { HelpCircle, Plus, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminFAQsPage() {
  const faqs = [
    { question: 'What documents are required to onboard a CA Firm?', answer: 'ICAI Registration Certificate, Partner PAN Cards, GSTIN, and Firm Incorporation documents.' },
    { question: 'How is data privacy ensured for client financial records?', answer: 'All files are encrypted with AES-256 at rest and TLS 1.3 in transit with Supabase Row Level Security (RLS).' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-lime-500" /> Platform FAQ Management
          </h1>
          <p className="text-sm text-slate-400">Manage public support FAQs and onboarding guide items</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add FAQ Item
        </Button>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800 p-6 space-y-2">
            <h3 className="font-bold text-slate-100 text-lg">{f.question}</h3>
            <p className="text-sm text-slate-300">{f.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
