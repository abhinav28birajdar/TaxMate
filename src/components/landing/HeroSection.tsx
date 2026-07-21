"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16 md:pb-24">
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-screen -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm shadow-[0_0_15px_rgba(101,163,13,0.3)]">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            TaxMate 2.0 is now live for Indian CAs
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            The Operating System for your <span className="text-primary text-glow block mt-2">CA Practice.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to manage clients, automate GST/ITR filings, securely store documents, and scale your firm effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold glass hover:bg-white/10 dark:hover:bg-slate-800/50">
                Book a Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="text-primary h-5 w-5 mr-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="text-primary h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="text-primary h-5 w-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
