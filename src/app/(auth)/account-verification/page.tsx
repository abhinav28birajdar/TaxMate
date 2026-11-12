'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { getDashboardPathForRole } from '@/lib/auth-routing';
import { toast } from 'sonner';

interface StageItem {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  date: string;
}

export default function AccountVerificationPage() {
  const { user, role } = useAuth();
  const [stages, setStages] = useState<StageItem[]>([]);
  const [score, setScore] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const checkVerificationStatus = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [profRes, docRes] = await Promise.all([
        fetch('/api/v1/profile', { credentials: 'include' }).catch(() => null),
        fetch('/api/documents?take=25', { credentials: 'include' }).catch(() => null),
      ]);

      const profJson = profRes && profRes.ok ? await profRes.json() : {};
      const docJson = docRes && docRes.ok ? await docRes.json() : {};

      const u = profJson.data?.user;
      const p = profJson.data?.profile;
      const docs: any[] = docJson.documents || [];

      const emailVerified = Boolean(u?.email_verified || user?.status === 'ACTIVE');
      const phonePresent = Boolean(p?.phone || u?.phone);
      const twoFactorActive = Boolean(p?.users?.two_factor_enabled || user?.twoFactorEnabled);
      const hasKycDoc = docs.some(
        (d) =>
          String(d.category || d.document_type || '').toLowerCase().includes('identity') ||
          String(d.file_name || '').toLowerCase().includes('pan')
      );

      const computed: StageItem[] = [
        {
          id: 1,
          title: 'Email Address Verification',
          status: emailVerified ? 'completed' : 'pending',
          date: emailVerified ? 'Email verified on TaxMate' : 'Confirm verification link in inbox',
        },
        {
          id: 2,
          title: 'Contact Phone On File',
          status: phonePresent ? 'completed' : 'pending',
          date: phonePresent ? 'Phone registered in profile' : 'Add phone in Settings',
        },
        {
          id: 3,
          title: 'KYC / Identity Document Uploaded',
          status: hasKycDoc ? 'completed' : 'pending',
          date: hasKycDoc ? 'KYC proof present in Vault' : 'Upload PAN / Aadhaar in Vault',
        },
        {
          id: 4,
          title: 'Two-Factor Authentication (2FA)',
          status: twoFactorActive ? 'completed' : 'pending',
          date: twoFactorActive ? 'TOTP 2FA active' : 'Recommended: configure in Security',
        },
      ];

      const completedCount = computed.filter((s) => s.status === 'completed').length;
      setStages(computed);
      setScore(Math.round((completedCount / computed.length) * 100));
    } catch (err: any) {
      toast.error(err?.message || 'Unable to verify account status');
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto py-4">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Account Readiness Check
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Account Verification</h1>
        <p className="text-sm text-gray-400">
          Review live verification milestones for your TaxMate account.
        </p>
      </div>

      <div className="bg-[#111111]/90 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {score}%
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Security &amp; KYC Readiness
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">
                {score === 100 ? 'Fully Verified Account' : 'Complete remaining steps'}
              </p>
            </div>
          </div>
          <Button
            onClick={checkVerificationStatus}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-white/15 text-xs rounded-xl hover:bg-white/5 text-gray-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => {
            const isDone = stage.status === 'completed';
            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDone ? 'bg-[#161616] border-white/10' : 'bg-black/40 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{stage.title}</h4>
                    <p className="text-[11px] text-gray-400">{stage.date}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {isDone ? 'Verified' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <Link href={getDashboardPathForRole(role)}>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl">
              Go to Workspace Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
