/**
 * Unified Authentication Context
 * Replaces multiple conflicting auth contexts (AuthContext, SupabaseAuthContext, DevelopmentAuthContext)
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

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
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  verifyTwoFactor: (token: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
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

  const supabase = createClient();

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

          // Fetch user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          } else if (profileData) {
            const userProfile: UserProfile = {
              id: profileData.id,
              email: profileData.email,
              name: profileData.full_name || '',
              role: (profileData.role?.toUpperCase() || 'CLIENT') as UserRole,
              avatarUrl: profileData.avatar_url || undefined,
              status: profileData.is_active ? 'ACTIVE' : 'INACTIVE',
              onboardingCompleted: profileData.is_verified || false,
              timezone: 'Asia/Kolkata',
              lastLoginAt: profileData.last_login_at || undefined,
              twoFactorEnabled: profileData.two_factor_enabled || false,
            };
            setUser(userProfile);
            setRole(userProfile.role);

            // Update last login
            await supabase
              .from('profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', currentSession.user.id);
          }
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
      } else if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        // Fetch fresh user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();

        if (profileData) {
          const userProfile: UserProfile = {
            id: profileData.id,
            email: profileData.email,
            name: profileData.full_name || '',
            role: (profileData.role?.toUpperCase() || 'CLIENT') as UserRole,
            avatarUrl: profileData.avatar_url || undefined,
            status: profileData.is_active ? 'ACTIVE' : 'INACTIVE',
            onboardingCompleted: profileData.is_verified || false,
            timezone: 'Asia/Kolkata',
            lastLoginAt: profileData.last_login_at || undefined,
            twoFactorEnabled: profileData.two_factor_enabled || false,
          };
          setUser(userProfile);
          setRole(userProfile.role);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user && !!session;

    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-email'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname?.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      if (!user?.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, pathname, router, session, user, user?.onboardingCompleted]);

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
          router.push('/dashboard');
        }
      } catch (error) {
        throw error;
      }
    },
    [supabase, router]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string, roleParam: UserRole) => {
      try {
        // First check if user already exists (optional but good for UX)
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) {
          toast.error('An account with this email already exists.');
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: roleParam,
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
          toast.error('This email is already taken. Please use a different one.');
          return;
        }

        // Profile is handled by database trigger (on_auth_user_created)
        // No manual public.profiles insert is required here.

        toast.success('Registration successful! Please check your email for verification.');
        router.push('/verify-email');
      } catch (error) {
        throw error;
      }
    },
    [supabase, router]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setRole(null);
      toast.success('Signed out successfully');
      router.push('/');
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

        const { error } = await supabase
          .from('profiles')
          .update(dbData)
          .eq('id', user.id);

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
    // Implementation would call backend API for 2FA setup
    toast.info('2FA setup not yet implemented');
    return { secret: '', qrCode: '' };
  }, []);

  const verifyTwoFactor = useCallback(async (token: string) => {
    // Implementation would verify 2FA token with backend
    toast.info('2FA verification not yet implemented');
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
