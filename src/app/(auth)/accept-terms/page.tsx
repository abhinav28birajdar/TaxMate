'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { getDashboardPathForRole } from '@/lib/auth-routing';
import { toast } from 'sonner';

export default function AcceptTermsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !agreedPrivacy) {
      toast.error('Please accept both Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/v1/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          step: 6,
          preferences: {
            acceptedTerms: true,
            acceptedPrivacy: true,
            acceptedAt: new Date().toISOString(),
          },
          completed: true,
        }),
      }).catch(() => {});

      toast.success('Welcome to TaxMate! Your workspace is ready.');
      router.push(getDashboardPathForRole(role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <Card className="border-white/10 bg-[#111111]/90 text-white shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Terms of Service &amp; Data Security
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Please review our platform commitments, privacy terms, and data processing guidelines.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="h-52 overflow-y-auto p-4 rounded-xl border border-white/10 bg-black/50 text-xs text-gray-300 space-y-3 leading-relaxed">
            <h4 className="font-bold text-white">1. Platform Service Scope</h4>
            <p>
              TaxMate provides compliance management tools, encrypted document storage, and communication interfaces between Chartered Accountants and their clients.
            </p>

            <h4 className="font-bold text-white">2. Financial Data Privacy &amp; DPDP Compliance</h4>
            <p>
              All client PANs, GSTINs, bank statements, and tax returns are encrypted at rest and protected via Supabase Row Level Security.
            </p>

            <h4 className="font-bold text-white">3. Professional Integrity</h4>
            <p>
              Chartered Accountants registered on TaxMate warrant that their ICAI membership credentials are valid and agree to protect client financial confidentiality.
            </p>

            <h4 className="font-bold text-white">4. Payment Processing</h4>
            <p>
              Payments for consultation and accounting engagements are routed securely via authorized payment gateways with server-side signature verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-black/40 border border-white/10">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={(c) => setAgreedTerms(!!c)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-gray-300 leading-tight cursor-pointer">
                I agree to the{' '}
                <Link
                  href="/terms-of-service"
                  className="text-emerald-400 font-semibold hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and platform acceptable use policy.
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-black/40 border border-white/10">
              <Checkbox
                id="privacy"
                checked={agreedPrivacy}
                onCheckedChange={(c) => setAgreedPrivacy(!!c)}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="text-xs text-gray-300 leading-tight cursor-pointer">
                I agree to the{' '}
                <Link
                  href="/privacy-policy"
                  className="text-emerald-400 font-semibold hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>{' '}
                and authorize TaxMate to store and process uploaded tax records.
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !agreedTerms || !agreedPrivacy}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Completing Setup...' : 'Accept & Enter Workspace'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-black/40 border-t border-white/10 py-3 text-center justify-center">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" /> TLS &amp; RLS Protected Data Vault
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
