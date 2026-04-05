'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type UserRole = 'client' | 'ca' | 'firm' | 'admin' | null;

interface SupabaseAuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole;
    loading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
    user: null,
    session: null,
    role: null,
    loading: true,
    error: null,
    signOut: async () => { },
});

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    // Create supabase client with error handling
    const supabase = useMemo(() => {
        try {
            return createClient();
        } catch (e: any) {
            console.error('Supabase client creation failed:', e);
            setError(e.message);
            return null;
        }
    }, []);

    // Helper to extract role from metadata or profile
    const getRole = (user: User | null): UserRole => {
        if (!user) return null;
        return (user.user_metadata?.role as UserRole) || 'client';
    };

    const fetchProfile = async (supabaseClient: SupabaseClient, user: User | null, userRole: UserRole) => {
        if (!user || !userRole || !supabaseClient) return null;

        const table = userRole === 'ca' ? 'ca_profiles' 
            : userRole === 'client' ? 'client_profiles' 
            : userRole === 'firm' ? 'firm_profiles'
            : null;

        if (!table) return null;

        try {
            const { data, error } = await supabaseClient
                .from(table)
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error("Profile fetch error:", error);
                return null;
            }
            return data;
        } catch (e) {
            console.error("Profile fetch exception:", e);
            return null;
        }
    };

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError(sessionError.message);
                }
                
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                const currentRole = getRole(currentUser);
                setRole(currentRole);

                if (currentUser && currentRole) {
                    const p = await fetchProfile(supabase, currentUser, currentRole);
                    setProfile(p);
                }
            } catch (e: any) {
                console.error('Auth init error:', e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            const currentRole = getRole(currentUser);
            setRole(currentRole);

            if (currentUser && currentRole) {
                const p = await fetchProfile(supabase, currentUser, currentRole);
                setProfile(p);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <SupabaseAuthContext.Provider value={{ user, session, role, loading, error, signOut }}>
            {children}
        </SupabaseAuthContext.Provider>
    );
}

export const useAuth = () => useContext(SupabaseAuthContext);
