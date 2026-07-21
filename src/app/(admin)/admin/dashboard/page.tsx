'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Wrench, 
  ArrowUpRight, 
  BadgeCheck 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            Super Admin Overview
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Platform Command Center</Badge>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Monitor CA firm approvals, system subscriptions, maintenance flags, and platform activity.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/ca-approvals">
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold shadow-lg shadow-lime-600/20">
              <ShieldCheck className="w-4 h-4 mr-2" /> Pending KYC Approvals (4)
            </Button>
          </Link>
          <Link href="/admin/maintenance">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              <Wrench className="w-4 h-4 mr-2 text-lime-400" /> Maintenance Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total CA Firms</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">142</p>
              </div>
              <div className="p-3 bg-lime-500/10 text-lime-400 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-lime-400 mt-3">+12 firms this month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total End Clients</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">3,890</p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Individual & Business accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly SaaS Revenue</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">₹4,85,000</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-emerald-400 mt-3">+18.5% YoY ARR growth</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">System Health</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">100% Operational</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">All 18 Edge Functions Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">CA Verification & KYC Queue</CardTitle>
              <CardDescription className="text-slate-400">Review member certificate documents before publishing CA profiles</CardDescription>
            </div>
            <Link href="/admin/ca-approvals">
              <Button variant="ghost" size="sm" className="text-lime-400 hover:text-lime-300">
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div>
                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                  CA Suresh Verma
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">ICAI Verification Pending</Badge>
                </h4>
                <p className="text-xs text-slate-400">Membership #589201 • Submitted 2 hours ago</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">Approve</Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">Reject</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div>
                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                  CA Meera Nambiar
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">COP Certificate Pending</Badge>
                </h4>
                <p className="text-xs text-slate-400">Membership #410298 • Submitted 5 hours ago</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">Approve</Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">Reject</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">System Status</CardTitle>
            <CardDescription className="text-slate-400">Live service metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">PostgreSQL DB:</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Healthy (24ms)</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Supabase Realtime:</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Connected</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Gemini 1.5 API Proxy:</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Operational</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Maintenance Mode:</span>
              <Badge className="bg-slate-800 text-slate-400 border-slate-700">Disabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
