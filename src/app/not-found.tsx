'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ChevronLeft, LayoutDashboard, Search, Users } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-600/10 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-8 relative z-10 bg-slate-800/60 border border-slate-700/60 p-8 sm:p-12 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-lime-600/20 text-lime-400 rounded-2xl flex items-center justify-center border border-lime-500/30 shadow-lg shadow-lime-600/20">
            <ShieldAlert className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-lime-600/20 text-lime-400 text-xs font-bold rounded-full border border-lime-500/30 uppercase tracking-widest">
            HTTP 404 Error
          </span>
          <h1 className="text-4xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            The requested page or document does not exist, has been moved, or requires specific portal authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/ca/dashboard" className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>CA Practice Portal</span>
              <LayoutDashboard className="w-4 h-4 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Clients, Returns & Tax Filings</p>
          </Link>

          <Link href="/client/dashboard" className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Client Tax Portal</span>
              <Users className="w-4 h-4 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Upload Documents & Tax Profile</p>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-700/60">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-semibold text-xs"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-lime-600/20"
          >
            <Home className="mr-1.5 h-4 w-4" />
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

