"use client";

import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CAReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-lime-500" /> Firm Performance & Practice Analytics
          </h1>
          <p className="text-sm text-slate-400">Quarterly growth reports, client acquisition, and billable hours analytics</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Download className="w-4 h-4" /> Export Analytics Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Q2 Practice Revenue</span>
          <p className="text-3xl font-bold text-lime-400">₹14,80,000</p>
          <span className="text-xs text-lime-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last quarter
          </span>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Active Client Portfolio</span>
          <p className="text-3xl font-bold text-slate-100">185 Clients</p>
          <span className="text-xs text-lime-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> +12 new corporate clients
          </span>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Filing Compliance Success</span>
          <p className="text-3xl font-bold text-slate-100">99.2%</p>
          <span className="text-xs text-slate-400">Zero late filing penalties</span>
        </Card>
      </div>
    </div>
  );
}
