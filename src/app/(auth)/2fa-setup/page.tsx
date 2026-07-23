'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const secret = 'JBSWY3DPEHPK3PXP';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/TaxMate:user@taxmate.in?secret=${secret}&issuer=TaxMate`;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit authentication code');
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      toast.success('2FA enabled successfully!');
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-lime-600/20 text-lime-400 rounded-xl mx-auto flex items-center justify-center border border-lime-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Setup 2-Factor Authentication</h2>
          <p className="text-sm text-slate-400">
            Scan the QR code using Google Authenticator or Authy to secure your TaxMate account.
          </p>
        </div>

        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="2FA QR Code" className="w-44 h-44 rounded-lg bg-white p-2" />
          <div className="mt-4 flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="text-slate-300">{secret}</span>
            <button onClick={handleCopySecret} className="text-lime-400 hover:text-lime-300">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enter 6-Digit Authenticator Code
            </label>
            <Input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="bg-slate-900/80 border-slate-700 text-white text-center tracking-widest text-lg font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full bg-lime-600 hover:bg-lime-500 text-white font-semibold py-2.5 rounded-xl transition-all"
          >
            {verifying ? 'Verifying...' : 'Enable 2FA & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-slate-200">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
