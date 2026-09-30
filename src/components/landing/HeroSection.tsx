"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16 md:pb-24 bg-[#0A0A0A] min-h-screen text-white">
      {/* Background Subtleties: Dark Grid pattern + Soft glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20"></div>
      
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse mix-blend-screen pointer-events-none -z-10" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-start text-left max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Enhanced Badge */}
          <div>
            <Link href="/updates" className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-sm transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30">
              <span className="relative flex h-2 w-2 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              TaxMate 2.0 is now live for Indian CAs
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
          
          {/* Typography */}
          <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] md:leading-[1.1]">
            The Operating System for <br className="hidden sm:block" />
            <span className="text-emerald-500 pb-2 block mt-2">your CA Practice.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed font-light">
            Everything you need to manage clients, automate GST/ITR filings, securely store documents, and scale your firm effortlessly in one unified dashboard.
          </p>
          
          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link href="/modules" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto h-14 flex items-center justify-center px-8 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_0_30px_rgba(5,150,105,0.5)] hover:-translate-y-0.5 border-0">
                Explore All 20 Modules
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 flex items-center justify-center px-8 text-base font-semibold bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 rounded-xl transition-all hover:-translate-y-0.5">
                Start Free Trial
              </button>
            </Link>
            <Link href="/client/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 flex items-center justify-center px-6 text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all hover:-translate-y-0.5">
                Customer Demo
              </button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-col items-start gap-6 w-full">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-gray-400">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mr-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mr-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mr-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 pt-6 border-t border-white/10 w-full max-w-md justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img 
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0A0A0A] object-cover" 
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="User avatar" 
                  />
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-emerald-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Trusted by 2,000+ CAs
                </p>
              </div>
            </div>
          </div>

          {/* Mockup / Dashboard Preview */}
          <div className="w-full mt-16 relative z-10">
            <div className="relative rounded-xl bg-white/5 p-2 ring-1 ring-inset ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
              <div className="rounded-lg overflow-hidden border border-white/10 bg-[#111111] shadow-2xl relative">
                <div className="flex items-center gap-2 border-b border-white/10 bg-[#1A1A1A] px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-4 flex-1 flex justify-center">
                    <div className="h-5 w-48 bg-white/5 rounded-md border border-white/5"></div>
                  </div>
                </div>
                <div className="aspect-[16/9] w-full bg-black/50 relative overflow-hidden flex">
                  <div className="w-64 border-r border-white/5 bg-white/5 hidden md:block p-4 space-y-4">
                    <div className="h-8 w-full bg-white/10 rounded-md mb-8"></div>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-6 w-3/4 bg-white/5 rounded-md"></div>
                    ))}
                  </div>
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-48 bg-white/10 rounded-md"></div>
                      <div className="h-8 w-32 bg-emerald-500/10 rounded-md border border-emerald-500/20"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-[#1A1A1A] rounded-lg border border-white/5 shadow-sm"></div>
                      ))}
                    </div>
                    <div className="h-64 bg-[#1A1A1A] rounded-lg border border-white/5 shadow-sm w-full"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}