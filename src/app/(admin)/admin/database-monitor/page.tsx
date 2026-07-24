"use client";

import React from 'react';
import { Database, HardDrive, Cpu, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AdminDatabaseMonitorPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-lime-500" /> Supabase Database & Connection Pool Monitor
        </h1>
        <p className="text-sm text-slate-400">PostgreSQL health, connection pool utilization, disk space, and RLS policy performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Database Size</span>
            <span className="font-mono text-lime-400 font-bold">14.2 GB / 50 GB</span>
          </div>
          <Progress value={28} className="h-2 bg-slate-950 [&>div]:bg-lime-600" />
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">PgBouncer Active Connections</span>
            <span className="font-mono text-slate-100 font-bold">42 / 200</span>
          </div>
          <Progress value={21} className="h-2 bg-slate-950 [&>div]:bg-lime-600" />
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Cache Hit Ratio</span>
            <span className="font-mono text-slate-100 font-bold">99.4%</span>
          </div>
          <Progress value={99.4} className="h-2 bg-slate-950 [&>div]:bg-lime-600" />
        </Card>
      </div>
    </div>
  );
}
