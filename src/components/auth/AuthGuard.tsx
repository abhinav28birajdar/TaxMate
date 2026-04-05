'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';

type UserRole = 'customer' | 'ca' | 'business' | 'any';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole = 'any',
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }
      
      // If role check is required
      if (requiredRole !== 'any' && profile?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        if (profile?.role) {
          switch (profile.role) {
            case 'customer':
              router.push('/dashboard/customer');
              break;
            case 'ca':
              router.push('/dashboard/ca');
              break;
            case 'business':
              router.push('/dashboard/business');
              break;
            default:
              router.push(redirectTo);
          }
        } else {
          // If no role is set, redirect to login
          router.push(redirectTo);
        }
      }
    }
  }, [user, profile, loading, router, requiredRole, redirectTo]);

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth check passed, render children
  if (!loading && user && (requiredRole === 'any' || profile?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}
