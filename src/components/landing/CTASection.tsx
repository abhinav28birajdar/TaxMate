"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0A] text-white z-10">
      {/* Background with glowing effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-emerald-600/10 blur-[150px] -z-10 rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="relative bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto shadow-2xl shadow-emerald-900/20 overflow-hidden">
          
          {/* Subtle inner top glow for the card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to <span className="text-emerald-500">transform</span> your practice?
          </h2>
          
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of modern Chartered Accountants who are saving time, increasing revenue, and delighting their clients with TaxMate.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto h-14 px-10 text-lg flex items-center justify-center font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_0_30px_rgba(5,150,105,0.5)] hover:-translate-y-0.5 border-0">
                Start Your 14-Day Free Trial
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-10 text-lg flex items-center justify-center font-semibold bg-[#222222] hover:bg-[#333333] text-white rounded-xl transition-all hover:-translate-y-0.5 border border-white/5">
                Talk to Sales
              </button>
            </Link>
          </div>
          
          <p className="mt-8 text-sm text-gray-500 font-medium">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}