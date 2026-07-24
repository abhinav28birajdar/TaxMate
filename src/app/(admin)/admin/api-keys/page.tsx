"use client";

import React from 'react';
import { Key, Plus, Eye, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminAPIKeysPage() {
  const keys = [
    { name: 'Supabase Edge Functions Service Key', key: 'sbp_live_secret_98124...', created: '10 Jan 2026', scope: 'Full BaaS' },
    { name: 'Gemini AI API Key', key: 'AIzaSyD-90124...', created: '15 Jan 2026', scope: 'LLM Proxy' },
    { name: 'LiveKit Cloud Server API Secret', key: 'API402918...', created: '20 Jan 2026', scope: 'RTC Token Gen' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-6 h-6 text-lime-500" /> Platform Integration API Keys
          </h1>
          <p className="text-sm text-slate-400">Manage third-party tokens for Gemini, LiveKit, Razorpay, Stripe, Resend & MSG91</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Generate Secret Key
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Integration Name</TableHead>
                <TableHead className="text-slate-400">Key Mask</TableHead>
                <TableHead className="text-slate-400">Scope</TableHead>
                <TableHead className="text-slate-400">Created</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{k.name}</TableCell>
                  <TableCell className="font-mono text-xs text-lime-400">{k.key}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-slate-300 border-slate-700">{k.scope}</Badge></TableCell>
                  <TableCell className="text-slate-300 text-xs">{k.created}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white gap-1">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
