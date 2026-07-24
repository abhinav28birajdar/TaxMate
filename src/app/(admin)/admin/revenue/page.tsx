"use client";

import React from 'react';
import { TrendingUp, DollarSign, ArrowUpRight, BarChart2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminRevenuePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-lime-500" /> Platform Revenue Analytics
        </h1>
        <p className="text-sm text-slate-400">MRR, ARR, subscription churn, and marketplace commission stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue (MRR)</span>
          <p className="text-3xl font-bold text-lime-400">₹14,50,000</p>
          <span className="text-xs text-lime-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% MoM
          </span>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Annual Run Rate (ARR)</span>
          <p className="text-3xl font-bold text-slate-100">₹1.74 Cr</p>
          <span className="text-xs text-slate-400">Target: ₹2.5 Cr</span>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Active Subscriptions</span>
          <p className="text-3xl font-bold text-slate-100">290 Firms</p>
          <span className="text-xs text-lime-400">+18 this month</span>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Gross Platform GMV</span>
          <p className="text-3xl font-bold text-slate-100">₹4.8 Cr</p>
          <span className="text-xs text-slate-400">Total processed</span>
        </Card>
      </div>
    </div>
  );
}
