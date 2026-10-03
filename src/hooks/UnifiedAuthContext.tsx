/**
 * Unified Authentication Context
 * Replaces multiple conflicting auth contexts (AuthContext, SupabaseAuthContext, DevelopmentAuthContext)
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { PUBLIC_ROUTES, getAuthRedirectForRole, getDashboardPathForRole, normalizeRole } from '@/lib/auth-routing';

export type UserRole = 'SUPER_ADMIN' | 'CA' | 'CLIENT' | 'STAFF' | null;
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  status: AccountStatus;
  onboardingCompleted: boolean;
  timezone: string;
  lastLoginAt?: string;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, metadata?: Record<string, string>) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  verifyTwoFactor: (token: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

type ProfileRecord = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  last_login_at?: string | null;
  two_factor_enabled?: boolean | null;
  timezone?: string | null;
};

function buildUserProfile(userId: string, email: string, profileData?: ProfileRecord | null): UserProfile {
  const role = normalizeRole(profileData?.role || null) ?? 'CLIENT';

  return {
    id: userId,
    email: profileData?.email || email,
    name: profileData?.full_name || email.split('@')[0] || '',
    role,
    avatarUrl: profileData?.avatar_url || undefined,
    status: profileData?.is_active === false ? 'INACTIVE' : profileData?.is_verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
    onboardingCompleted: Boolean(profileData?.is_verified),
    timezone: profileData?.timezone || 'Asia/Kolkata',
    lastLoginAt: profileData?.last_login_at || undefined,
    twoFactorEnabled: Boolean(profileData?.two_factor_enabled),
  };
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  resendEmailVerification: async () => {},
  signOut: async () => {},
  verifyOTP: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  enableTwoFactor: async () => ({ secret: '', qrCode: '' }),
  verifyTwoFactor: async () => {},
  refreshSession: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const supabase = useMemo(() => createClient(), []);

  const syncProfile = useCallback(
    async (authUser: Session['user']) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const profile = buildUserProfile(authUser.id, authUser.email ?? '', profileData as ProfileRecord | null);
      setUser(profile);
      setRole(profile.role);

      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          ...(authUser.email_confirmed_at ? { is_verified: true, is_active: true } : {}),
        })
        .eq('id', authUser.id);
    },
    [supabase]
  );

  // Initialize auth state from session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get current session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);

          await syncProfile(currentSession.user);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setRole(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession) {
        setSession(newSession);
        await syncProfile(newSession.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, syncProfile]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user && !!session;

    const isPublicRoute = pathname
      ? PUBLIC_ROUTES.some((route) => route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`))
      : false;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname || '/landing')}`);
    } else if (isAuthenticated && ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some((route) => pathname?.startsWith(route))) {
      router.replace(getAuthRedirectForRole(user?.role));
    }
  }, [isLoading, pathname, router, session, user]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Handle specific Supabase error codes for better user feedback
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Incorrect email or password. Please check your credentials.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Email not verified. Please check your inbox for the verification link.');
          } else {
            toast.error(error.message);
          }
          throw error;
        }

        if (data.session) {
          toast.success('Signed in successfully');
          router.push(getDashboardPathForRole(data.user?.app_metadata?.role || role));
        }
      } catch (error) {
        throw error;
      }
    },
    [supabase, router, role]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string, roleParam: UserRole, metadata: Record<string, string> = {}) => {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: roleParam,
              ...metadata,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            toast.error('This email is already registered. Try logging in.');
          } else {
            toast.error(signUpError.message);
          }
          throw signUpError;
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('This email is already taken. Please use a different one.');
        }

        // Profile is handled by database trigger (on_auth_user_created)
        // No manual public.profiles insert is required here.

        if (data.session) {
          toast.success('Account created successfully. Welcome to TaxMate.');
          router.replace(getDashboardPathForRole(roleParam));
        } else {
          window.localStorage.setItem('taxmate.pendingVerificationEmail', email);
          toast.success('Account created. Please check your email to verify your account.');
          router.replace('/verify-email');
        }
      } catch (error) {
        throw error;
      }
    },
    [supabase, router]
  );

  const resendEmailVerification = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      window.localStorage.setItem('taxmate.pendingVerificationEmail', email);
      toast.success('Verification email sent. Check your inbox.');
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setRole(null);
      toast.success('Signed out successfully');
      router.push('/landing');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      toast.error(message);
      throw error;
    }
  }, [supabase, router]);

  const verifyOTP = useCallback(
    async (phone: string, token: string) => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms',
        });

        if (error) throw error;
        toast.success('Phone verified successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OTP verification failed';
        toast.error(message);
        throw error;
      }
    },
    [supabase]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) throw error;
        toast.success('Password reset email sent. Check your inbox.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset failed';
        toast.error(message);
        throw error;
      }
    },
    [supabase]
  );

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return;

      try {
        const dbData: any = {};
        if (data.name !== undefined) dbData.full_name = data.name;
        if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;
        if (data.timezone !== undefined) dbData.timezone = data.timezone;
        if (data.twoFactorEnabled !== undefined) dbData.two_factor_enabled = data.twoFactorEnabled;

        const { error } = await supabase.from('profiles').update(dbData).eq('id', user.id);

        if (error) throw error;

        setUser({ ...user, ...data });
        toast.success('Profile updated successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Profile update failed';
        toast.error(message);
        throw error;
      }
    },
    [supabase, user]
  );

  const enableTwoFactor = useCallback(async () => {
    const response = await fetch('/api/auth/setup-2fa', { method: 'POST' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || '2FA setup failed');
    }
    toast.success('Scan the QR code and enter the code to finish setup.');
    return { secret: result.secret, qrCode: result.qrCode };
  }, []);

  const verifyTwoFactor = useCallback(async (token: string) => {
    const response = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || '2FA verification failed');
    }
    toast.success('Two-factor authentication enabled.');
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      toast.success('Session refreshed');
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, [supabase]);

  const value: AuthContextType = {
    user,
    session,
    role,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    resendEmailVerification,
    signOut,
    verifyOTP,
    resetPassword,
    updateProfile,
    enableTwoFactor,
    verifyTwoFactor,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Utility hook for protecting routes
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (requiredRole && role !== requiredRole && role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, isLoading, requiredRole, role, router]);

  return { user, isLoading };
}
