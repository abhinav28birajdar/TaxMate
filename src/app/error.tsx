'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Phone } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-orange-500/10 border border-orange-500/30 rounded-full p-6">
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 italic">
            500
          </h1>
          <h2 className="text-3xl font-bold text-white italic">Server Error</h2>
          <p className="text-lg text-slate-400">
            Something went wrong on our end. Our team has been notified and is working on a fix.
          </p>
        </div>

        {/* Error Details (if available) */}
        {error?.message && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-h-32 overflow-auto">
            <p className="text-xs text-red-300 font-mono break-words">
              <span className="text-red-400 font-bold">Error: </span>
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 mt-2">
                <span className="font-bold">Reference ID: </span>{error.digest}
              </p>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={reset}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-none font-bold uppercase tracking-widest"
          >
            Try Again
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-black rounded-none font-bold uppercase tracking-widest"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard/support')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-none font-bold uppercase tracking-widest"
          >
            <Phone className="mr-2 h-4 w-4" />
            Support
          </Button>
        </div>

        {/* Footer Text */}
        <div className="pt-8 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
            Error Code: 500 | Internal Server Error
          </p>
        </div>
      </div>
    </div>
  );
}
