'use client';

import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Receipt, 
  Clock, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Bot,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Client Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Track ongoing CA services, GST/ITR filings, pending invoices, and document uploads.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/client/find-ca">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              <Search className="w-4 h-4 mr-2" /> Find & Hire a CA
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/client/documents/upload" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-lime-600 transition-all group">
          <div className="w-10 h-10 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-xl flex items-center justify-center mb-2 group-hover:bg-lime-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Documents</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upload bills, Bank Statements & Form 26AS</p>
        </Link>

        <Link href="/client/gst" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-lime-600 transition-all group">
          <div className="w-10 h-10 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-xl flex items-center justify-center mb-2 group-hover:bg-lime-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">GST Compliance</h3>
          <p className="text-xs text-slate-500 mt-0.5">View GSTR-1 & 3B return status</p>
        </Link>

        <Link href="/client/invoices" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-lime-600 transition-all group">
          <div className="w-10 h-10 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-xl flex items-center justify-center mb-2 group-hover:bg-lime-600 group-hover:text-white transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invoices & Pay</h3>
          <p className="text-xs text-slate-500 mt-0.5">Pay CA fees via UPI / Razorpay</p>
        </Link>

        <Link href="/client/ai-assistant" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-lime-600 transition-all group">
          <div className="w-10 h-10 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-xl flex items-center justify-center mb-2 group-hover:bg-lime-600 group-hover:text-white transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ask AI Assistant</h3>
          <p className="text-xs text-slate-500 mt-0.5">Instant tax law advice</p>
        </Link>
      </div>

      {/* Active CA Engagements & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            Active CA Engagements
            <Link href="/client/find-ca" className="text-xs text-lime-600 dark:text-lime-400 hover:underline">Find More CAs</Link>
          </h2>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime-600/20 text-lime-600 font-bold flex items-center justify-center">
                RS
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">CA Rajesh Sharma & Associates</h4>
                <p className="text-xs text-slate-500">Service: Annual GST & Tax Audit | Experience: 12 Yrs</p>
              </div>
            </div>
            <Link href="/client/chat">
              <Button size="sm" variant="outline">Message CA</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Compliance Deadlines</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">GSTR-3B Return Filing</div>
                <div className="text-slate-500">Period: September 2026</div>
              </div>
              <span className="font-bold text-red-500">Due: 20 Oct</span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">TDS Quarter 2 Deposit</div>
                <div className="text-slate-500">Period: Q2 FY 2026-27</div>
              </div>
              <span className="font-bold text-amber-500">Due: 31 Oct</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
