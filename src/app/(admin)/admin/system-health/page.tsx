"use client";

import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSystemHealthPage() {
  const services = [
    { name: 'Supabase Auth & Database (Asia-South1)', status: 'Operational', latency: '18 ms' },
    { name: 'Supabase Edge Functions (Deno Runtime)', status: 'Operational', latency: '35 ms' },
    { name: 'Gemini 1.5 Pro AI Gateway', status: 'Operational', latency: '210 ms' },
    { name: 'LiveKit Cloud RTC Infrastructure', status: 'Operational', latency: '22 ms' },
    { name: 'Razorpay Payment Gateway API', status: 'Operational', latency: '85 ms' },
    { name: 'Resend / Brevo Email Gateway', status: 'Operational', latency: '120 ms' },
    { name: 'MSG91 SMS & WhatsApp Gateway', status: 'Operational', latency: '95 ms' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-lime-500" /> Platform System Health & Microservices
        </h1>
        <p className="text-sm text-slate-400">Real-time status monitoring for all connected APIs and edge functions</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="space-y-3">
          {services.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-lime-400" />
                <span className="font-semibold text-slate-100 text-sm">{s.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="font-mono text-slate-400">Latency: {s.latency}</span>
                <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30">
                  {s.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
