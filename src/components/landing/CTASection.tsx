"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with glowing effect */}
      <div className="absolute inset-0 bg-primary/5 -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/20 blur-[150px] -z-10 rounded-full" />

      <div className="container mx-auto px-4">
        <div className="bg-card/50 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto shadow-2xl shadow-primary/10">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to transform your practice?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of modern Chartered Accountants who are saving time, increasing revenue, and delighting their clients with TaxMate.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/25">
                Start Your 14-Day Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-semibold glass hover:bg-card/80">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
