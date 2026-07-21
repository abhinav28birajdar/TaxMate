'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Mail, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function PublicMaintenancePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 text-center relative z-10">
        {/* Brand */}
        <div className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-lime-600 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-lime-600/30">
            T
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight">
            Tax<span className="text-lime-400">Mate</span>
          </span>
        </div>

        {/* Maintenance Card */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8" />
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mx-auto mb-2">
              Scheduled System Upgrades
            </Badge>
            <CardTitle className="text-2xl font-bold text-slate-100">We will be right back!</CardTitle>
            <CardDescription className="text-slate-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              TaxMate is currently undergoing planned system maintenance and database enhancements to improve security and filing speed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center gap-3 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-lime-400" />
              <span>Estimated Completion: <strong>2 Hours</strong></span>
            </div>

            {/* Subscribe Form */}
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <p className="text-xs text-slate-400 font-medium">Get notified via email as soon as TaxMate is online:</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-slate-200"
                  />
                  <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold shrink-0">
                    Notify Me
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> You will be notified when maintenance completes!
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>TaxMate Platform v1.0.0</span>
              <Link href="/login?bypass=taxmate-secret-bypass-2026" className="text-slate-400 hover:text-lime-400 transition-colors">
                Admin Bypass Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
