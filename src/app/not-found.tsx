"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ChevronLeft, LayoutDashboard, Sparkles, Layers } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtleties */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-xl w-full text-center space-y-8 relative z-10 bg-[#111111]/90 border border-white/10 p-8 sm:p-12 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <FileQuestion className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-widest">
            HTTP 404 Error
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Page Not Found</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            The tax docket, portal link, or resource you are looking for does not exist or has been archived.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/ca/dashboard" className="p-4 bg-[#18181b] hover:bg-[#202024] border border-white/10 hover:border-emerald-500/40 rounded-xl text-left transition-all group">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>CA Practice Portal</span>
              <LayoutDashboard className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Clients, Returns & Tax Filings</p>
          </Link>

          <Link href="/modules" className="p-4 bg-[#18181b] hover:bg-[#202024] border border-white/10 hover:border-emerald-500/40 rounded-xl text-left transition-all group">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-emerald-400" /> All 20 Modules</span>
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Explore complete TaxMate system</p>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/10 text-gray-300 hover:bg-white/5 rounded-xl font-semibold text-xs px-5 py-2.5"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Home className="mr-1.5 h-4 w-4" />
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
