'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthHook';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardIndex() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile?.role) {
      // Redirect to the appropriate role-specific dashboard
      router.push(`/dashboard/${profile.role}`);
    } else if (!loading) {
      // If no role is found but the user is authenticated, default to customer
      router.push('/dashboard/customer');
    }
  }, [profile, loading, router]);

  // Show loading while redirecting
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Redirecting to your dashboard...</p>
      </div>
    </AuthGuard>
  );
}