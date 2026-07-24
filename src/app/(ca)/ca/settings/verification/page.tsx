"use client";

import React from 'react';
import { ShieldCheck, Upload, CheckCircle2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CAVerificationPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-500" /> ICAI Verification & Certificates
        </h1>
        <p className="text-sm text-slate-400">Manage statutory ICAI COP, PAN, and Firm registration verification status</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-lime-400" />
            <div>
              <span className="font-bold text-slate-100 block">ICAI Membership Certificate (FCA)</span>
              <span className="text-xs text-slate-400">Membership No: FCA-402918 (Verified on 12 Jan 2026)</span>
            </div>
          </div>
          <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30">VERIFIED</Badge>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-lime-400" />
            <div>
              <span className="font-bold text-slate-100 block">Firm GST Registration Certificate</span>
              <span className="text-xs text-slate-400">GSTIN: 27AABCU9603R1ZM</span>
            </div>
          </div>
          <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30">VERIFIED</Badge>
        </div>
      </Card>
    </div>
  );
}
