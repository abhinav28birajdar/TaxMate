"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowRight, Sparkles, PhoneCall } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-lime-600/30">
            T
          </span>
          <span className="text-slate-900 dark:text-white">Tax<span className="text-lime-600 dark:text-lime-500">Mate</span></span>
        </Link>
        
        <div className="hidden lg:flex gap-6 items-center">
          <Link href="/about" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            About Us
          </Link>
          <Link href="/pricing" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Pricing & Plans
          </Link>
          <Link href="/faq" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            FAQ
          </Link>
          <Link href="/talk-sales" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-lime-600" /> Talk to Sales
          </Link>
          <Link href="/contact" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Contact Support
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/demo">
            <Button variant="outline" size="sm" className="hidden sm:flex text-xs font-semibold border-slate-300 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-lime-600" /> Book Demo
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs shadow-md shadow-lime-600/20">
              Start 14-Day Free Trial <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
