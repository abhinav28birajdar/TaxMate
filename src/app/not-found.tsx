'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, ChevronLeft } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-red-500/10 border border-red-500/30 rounded-full p-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 italic">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white italic">Page Not Found</h2>
          <p className="text-lg text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-none font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-black rounded-none font-bold uppercase tracking-widest"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Footer Text */}
        <div className="pt-8 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
            Error Code: 404 | Not Found
          </p>
        </div>
      </div>
    </div>
  );
}
