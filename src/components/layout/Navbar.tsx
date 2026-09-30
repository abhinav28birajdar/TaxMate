"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowRight, Sparkles, Layers, Search } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-xl tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(5,150,105,0.4)]">
            T
          </span>
          <span className="text-white font-bold">Tax<span className="text-emerald-500">Mate</span></span>
        </Link>
        
        <div className="hidden lg:flex gap-6 items-center">
          <Link href="/modules" className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
            <Layers className="w-3.5 h-3.5 mr-1.5" /> All 20 Modules
          </Link>
          <Link href="/pricing" className="text-xs font-semibold text-gray-300 hover:text-emerald-400 transition-colors">
            Pricing & Plans
          </Link>
          <Link href="/client/dashboard" className="text-xs font-semibold text-gray-300 hover:text-emerald-400 transition-colors">
            Customer Portal
          </Link>
          <Link href="/ca/dashboard" className="text-xs font-semibold text-gray-300 hover:text-emerald-400 transition-colors">
            CA Portal
          </Link>
          <Link href="/admin/dashboard" className="text-xs font-semibold text-gray-300 hover:text-emerald-400 transition-colors">
            Admin Panel
          </Link>
          <Link href="/faq" className="text-xs font-semibold text-gray-300 hover:text-emerald-400 transition-colors">
            FAQ & Docs
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/modules" className="flex lg:hidden text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-3.5 h-3.5 mr-1" /> Modules
          </Link>
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_0_30px_rgba(5,150,105,0.5)]">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
