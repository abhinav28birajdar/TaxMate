'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Copy, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { getDashboardPathForRole } from '@/lib/auth-routing';
import { toast } from 'sonner';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, enableTwoFactor, verifyTwoFactor } = useAuth();

  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingSetup(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingSetup(true);
        const res = await enableTwoFactor();
        if (!cancelled) {
          setSecret(res.secret);
          setQrUrl(res.qrCode);
        }
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.message || 'Unable to initialize 2FA setup.');
        }
      } finally {
        if (!cancelled) setLoadingSetup(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, enableTwoFactor]);

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard?.writeText(secret);
    setCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit authentication code');
      return;
    }

    setVerifying(true);
    try {
      await verifyTwoFactor(code);
      router.push(getDashboardPathForRole(role));
    } catch (err: any) {
      toast.error(err?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#111111]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-xl mx-auto flex items-center justify-center border border-emerald-500/30">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">Setup 2-Factor Authentication</h1>
        <p className="text-xs text-gray-400">
          Scan the QR code with Google Authenticator or Authy to secure your account.
        </p>
      </div>

      {!authLoading && !user ? (
        <div className="text-center space-y-4 py-4">
          <p className="text-sm text-gray-300">
            Please sign in first to generate a personal 2FA authenticator key.
          </p>
          <Link href="/login?redirectTo=/2fa-setup">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      ) : loadingSetup ? (
        <div className="py-10 flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          Generating unique TOTP secret...
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center bg-black/50 p-4 rounded-xl border border-white/10">
            {qrUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={qrUrl} alt="2FA QR Code" className="w-44 h-44 rounded-lg bg-white p-2" />
            )}
            {secret && (
              <div className="mt-4 flex items-center gap-2 bg-[#161616] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                <span className="text-gray-300 break-all">{secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="text-emerald-400 hover:text-emerald-300 shrink-0"
                  aria-label="Copy 2FA secret"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Enter 6-Digit Authenticator Code
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="h-11 bg-black/50 border-white/15 text-white text-center tracking-widest text-lg font-mono rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all"
            >
              {verifying ? 'Verifying...' : 'Enable 2FA & Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="text-center">
            <Link href={getDashboardPathForRole(role)} className="text-xs text-gray-400 hover:text-white">
              Skip for now
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
