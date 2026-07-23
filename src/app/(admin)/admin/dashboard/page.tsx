'use client';

import { 
  Users, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Super Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Platform management, CA firm approvals, recurring subscriptions, and system health.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Active Users</span>
            <Users className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">1,482</div>
          <span className="text-[10px] text-lime-400 font-semibold">+12.4% this month</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified CA Firms</span>
            <Building2 className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">248</div>
          <span className="text-[10px] text-lime-400 font-semibold">18 pending KYC</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Platform MRR</span>
            <CreditCard className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-extrabold text-lime-400 mt-2">₹18,45,000</div>
          <span className="text-[10px] text-lime-400 font-semibold">+18.5% MoM</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>System Health</span>
            <Server className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">99.98%</div>
          <span className="text-[10px] text-slate-400">Supabase DB & Edge Active</span>
        </div>
      </div>

      {/* Verification Queue & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between">
            Pending CA Approvals & KYC
            <span className="text-xs bg-lime-600/20 text-lime-400 px-2 py-0.5 rounded border border-lime-500/30">18 Pending</span>
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { name: 'CA Ramesh Shah & Co', membership: 'ICAI-148920', date: '22 Oct 2026' },
              { name: 'Mehta Compliance Group', membership: 'ICAI-204192', date: '21 Oct 2026' },
            ].map((ca, idx) => (
              <div key={idx} className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{ca.name}</div>
                  <div className="text-slate-400">{ca.membership} | Received: {ca.date}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white text-xs">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">System Security & Audit Logs</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Super Admin updated Maintenance Bypass Secret</div>
                <div className="text-slate-400">User: admin@taxmate.in | IP: 103.22.41.12</div>
              </div>
              <span className="text-[10px] text-slate-400">10 mins ago</span>
            </div>
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">New Firm Registered: Apex Logistics</div>
                <div className="text-slate-400">Plan: Pro Tier (Yearly)</div>
              </div>
              <span className="text-[10px] text-slate-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
