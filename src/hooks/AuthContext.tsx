'use client';

/**
 * Auth Context Provider
 * 
 * Provides authentication state and user profile management.
 * Handles session persistence, refresh, and realtime updates.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'ca' | 'client' | 'firm' | 'admin' | null;

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isCA: boolean;
  isClient: boolean;
  isFirm: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, role: UserRole, metadata?: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'azure' | 'github') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updatePresence: (status: 'online' | 'away' | 'offline') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  profile: null,
  loading: true,
  error: null,
  isCA: false,
  isClient: false,
  isFirm: false,
  isAdmin: false,
  isAuthenticated: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInWithOAuth: async () => ({ success: false }),
  signOut: async () => {},
  refreshUserProfile: async () => {},
  updatePresence: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create supabase client with error handling
  const getSupabase = useCallback(() => {
    try {
      return createClient();
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }, []);

  const supabase = getSupabase();

  const extractRole = useCallback((user: User | null): UserRole => {
    if (!user) return null;
    return (user.user_metadata?.role as UserRole) || 'client';
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, userRole: UserRole): Promise<UserProfile | null> => {
    if (!supabase || !userRole) return null;

    try {
      const table = userRole === 'ca' ? 'ca_profiles' 
                  : userRole === 'firm' ? 'firm_profiles'
                  : 'client_profiles';
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (e) {
      console.error('Error fetching profile:', e);
      return null;
    }
  }, [supabase]);

  const refreshUserProfile = useCallback(async () => {
    if (user && role) {
      const profileData = await fetchUserProfile(user.id, role);
      setProfile(profileData);
    }
  }, [user, role, fetchUserProfile]);

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline') => {
    if (!supabase || !user) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen_at: new Date().toISOString(),
          current_page: pathname,
        });
    } catch (e) {
      console.error('Error updating presence:', e);
    }
  }, [supabase, user, pathname]);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError('Supabase not configured');
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted || abortController.signal.aborted) return;
        
        if (sessionError) {
          // Ignore abort errors
          if (sessionError.message?.includes('signal is aborted')) {
            console.debug('Auth initialization aborted (expected)');
          } else {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
          }
        }
        
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          const userRole = extractRole(initialSession.user);
          setRole(userRole);

          if (userRole) {
            const userProfile = await fetchUserProfile(initialSession.user.id, userRole);
            if (isMounted && !abortController.signal.aborted) {
              setProfile(userProfile);
            }
          }

          // Set initial presence
          await updatePresence('online');
        }
      } catch (e: unknown) {
        if (!isMounted || abortController.signal.aborted) return;
        
        if (e instanceof Error && e.message?.includes('signal is aborted')) {
          console.debug('Auth initialization cancelled');
        } else {
          console.error('Auth initialization error:', e);
          setError('Failed to initialize authentication');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted || abortController.signal.aborted) return;
        
        console.log('Auth state change:', event);
        
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        const userRole = extractRole(currentUser);
        setRole(userRole);

        if (currentUser && userRole) {
          const userProfile = await fetchUserProfile(currentUser.id, userRole);
          if (isMounted && !abortController.signal.aborted) {
            setProfile(userProfile);
          }
          
          // Update presence on sign in
          if (event === 'SIGNED_IN') {
            await updatePresence('online');
          }
        } else {
          setProfile(null);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole(null);
        }

        if (isMounted) {
          setLoading(false);
          setError(null);
        }
      }
    );

    return () => {
      isMounted = false;
      abortController.abort();
      subscription?.unsubscribe();
    };
  }, [supabase, extractRole, fetchUserProfile, updatePresence]);

  // Setup presence heartbeat
  useEffect(() => {
    if (!user || !supabase) return;

    // Update presence every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      updatePresence('online');
    }, 30000);

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, supabase, updatePresence]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Sign in failed';
      console.error('Sign in error:', e);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Sign up with email/password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userRole: UserRole, 
    metadata?: Record<string, unknown>
  ) => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userRole,
            ...metadata,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Sign up failed';
      console.error('Sign up error:', e);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google' | 'azure' | 'github') => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'OAuth sign in failed';
      console.error('OAuth error:', e);
      return { success: false, error: message };
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return;

    try {
      // Update presence to offline
      await updatePresence('offline');
      
      // Sign out
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setSession(null);
      setRole(null);
      setProfile(null);
      
      // Redirect to login
      router.push('/login');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  }, [supabase, router, updatePresence]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      role, 
      profile, 
      loading, 
      error,
      isCA: role === 'ca',
      isClient: role === 'client',
      isFirm: role === 'firm',
      isAdmin: role === 'admin',
      isAuthenticated: !!user,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      refreshUserProfile,
      updatePresence,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
