'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, Loader2, QrCode, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { toast } from 'sonner';

export default function Admin2FAPage() {
  const router = useRouter();
  const { enableTwoFactor, verifyTwoFactor } = useAuth();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleInitSetup = async () => {
    setLoadingSetup(true);
    try {
      const result = await enableTwoFactor();
      setQrUrl(result.qrCode || null);
      setSecret(result.secret || null);
      toast.success('2FA secret generated. Scan with your authenticator app.');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to initialize 2FA');
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      toast.error('Enter the 6-digit authenticator code.');
      return;
    }
    setVerifying(true);
    try {
      await verifyTwoFactor(code.trim());
      toast.success('Admin 2FA verified and enforced!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
      </Button>

      <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-lime-600/15 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Admin Two-Factor Security</h1>
            <p className="text-xs text-slate-400">Enroll or verify TOTP authenticator protection for your admin account</p>
          </div>
        </div>

        {!secret && !qrUrl ? (
          <Button
            onClick={handleInitSetup}
            disabled={loadingSetup}
            variant="outline"
            className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            {loadingSetup ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating TOTP Secret...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2 text-lime-400" /> Generate New Authenticator Secret
              </>
            )}
          </Button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
            {qrUrl && (
              <img src={qrUrl} alt="Authenticator QR Code" className="w-40 h-40 mx-auto rounded-xl bg-white p-2" />
            )}
            {secret && (
              <div className="text-xs text-slate-400">
                Manual Key: <code className="text-lime-400 font-mono font-bold select-all">{secret}</code>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit TOTP Verification Code</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 font-mono tracking-widest"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={verifying}
            className="w-full bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Code...
              </>
            ) : (
              'Verify & Enable 2FA'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
