'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/UnifiedAuthContext';

export default function PageRedirect() {
  const auth = useAuth();
  const user = (auth as any).user;
  const loading = (auth as any).loading ?? (auth as any).isLoading;
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is already logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If no user, redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-3 text-lg">Redirecting...</p>
    </div>
  );
}
