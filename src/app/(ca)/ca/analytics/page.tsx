'use client';

import { BarChart3, TrendingUp, Users, DollarSign, CheckCircle2 } from 'lucide-react';

export default function CAAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-lime-600" /> Firm Performance & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">Revenue trends, client retention rates, filing productivity, and SLA compliance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">YTD Revenue Growth</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">+28.4%</div>
          <span className="text-[10px] text-slate-400">Total ₹14.8 Lakhs</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">On-Time Return Filings</span>
          <div className="text-2xl font-extrabold text-emerald-500 mt-1">98.2%</div>
          <span className="text-[10px] text-slate-400">0 Late Fees Incurred</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Average Review Rating</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">4.9 / 5.0</div>
          <span className="text-[10px] text-slate-400">Based on 52 Client Reviews</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Client Renewal Rate</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">96.5%</div>
          <span className="text-[10px] text-slate-400">Annual Subscriptions</span>
        </div>
      </div>
    </div>
  );
}
