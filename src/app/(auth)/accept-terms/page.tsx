'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function AcceptTermsPage() {
  const router = useRouter();
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !agreedPrivacy) {
      toast.error('Please accept both Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Welcome to TaxMate! Your account setup is complete.');
      router.push('/ca/dashboard');
    }, 800);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6">
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-lime-600/10 text-lime-600 flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Terms of Service & Data Security
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Please review our platform commitments, privacy terms, and data processing guidelines.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scrollable Terms Text */}
          <div className="h-52 overflow-y-auto p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white">1. Platform Service Scope</h4>
            <p>
              TaxMate is a multi-tenant digital infrastructure platform providing compliance management tools, document storage, and communication interfaces between Chartered Accountants and their clients.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white">2. Financial Data Privacy & DPDP Compliance</h4>
            <p>
              We comply with India's Digital Personal Data Protection Act (DPDP). All client PANs, GSTINs, bank statements, and tax returns are encrypted at rest using AES-256 and in transit via TLS 1.3.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white">3. Professional Integrity & ICAI Standards</h4>
            <p>
              Chartered Accountants registered on TaxMate warrant that their ICAI membership credentials are valid and in good standing. CAs agree to maintain professional ethics and strict confidentiality regarding all client financial records.
            </p>

            <h4 className="font-bold text-slate-900 dark:text-white">4. Payment Processing & Escrow</h4>
            <p>
              Payments for consultation and accounting engagements are securely routed via RBI-authorized payment gateways (Razorpay / Stripe).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={(c) => setAgreedTerms(!!c)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-slate-700 dark:text-slate-300 leading-tight cursor-pointer">
                I have read and agree to the <Link href="/terms-of-service" className="text-lime-600 font-semibold hover:underline" target="_blank">Terms of Service</Link> and platform acceptable use policy.
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <Checkbox
                id="privacy"
                checked={agreedPrivacy}
                onCheckedChange={(c) => setAgreedPrivacy(!!c)}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="text-xs text-slate-700 dark:text-slate-300 leading-tight cursor-pointer">
                I agree to the <Link href="/privacy-policy" className="text-lime-600 font-semibold hover:underline" target="_blank">Privacy Policy</Link> and authorize TaxMate to process financial data for tax filing.
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !agreedTerms || !agreedPrivacy}
              className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold rounded-xl py-5 shadow-md shadow-lime-600/30 text-xs mt-2"
            >
              {loading ? 'Completing Setup...' : 'Accept & Enter Workspace'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 py-3 text-center justify-center">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3 text-lime-600" /> End-to-End 256-Bit Encrypted Data Vault
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
