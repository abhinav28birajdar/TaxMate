'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Database } from '@/lib/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: UserRole | null;
  is_verified?: boolean;
  consultation_rate?: number;
  bio?: string;
  specializations?: string[];
  company_name?: string;
  company_size?: string;
  industry?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  session: Session | null;
}

const SupabaseAuthContext = createContext<AuthContextType | null>(null);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initial session fetch
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Failed to restore session');
          return;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user);
        }
      } catch (error) {
        console.error('Unexpected error during session retrieval:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: Session | null) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (currentUser: User) => {
    if (!currentUser) return null;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      
      if (!profileData) {
        console.error('No profile found for user');
        return;
      }
      
      // Fetch additional details based on role
      let additionalDetails = {};
      
      if (profileData.role === 'ca') {
        const { data: caDetails } = await supabase
          .from('ca_details')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
          
        if (caDetails) {
          additionalDetails = {
            is_verified: caDetails.is_verified,
            consultation_rate: caDetails.consultation_rate,
            bio: caDetails.bio,
            specializations: caDetails.specializations,
          };
        }
      } else if (profileData.role === 'business') {
        const { data: businessDetails } = await supabase
          .from('business_details')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
          
        if (businessDetails) {
          additionalDetails = {
            company_name: businessDetails.company_name,
            company_size: businessDetails.company_size,
            industry: businessDetails.industry,
          };
        }
      }
      
      setProfile({
        ...profileData,
        ...additionalDetails,
      });
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => {
    try {
      setLoading(true);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing up:', error);
        
        let errorMessage = 'Failed to create account';
        if (error.message.includes('already')) {
          errorMessage = 'This email is already registered';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password is too weak';
        }
        
        toast.error(errorMessage);
        throw error;
      }
      
      if (!data.user) {
        toast.error('Failed to create user');
        throw new Error('No user returned after signup');
      }
      
      // Create user profile in Supabase DB
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email,
          role,
          display_name: additionalData?.display_name || null,
          photo_url: additionalData?.photo_url || null,
        }]);
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast.error('Failed to create user profile');
        throw profileError;
      }
      
      // Create additional details based on role
      if (role === 'ca' && additionalData) {
        const { error: caError } = await supabase
          .from('ca_details')
          .insert([{
            user_id: data.user.id,
            bio: additionalData.bio || null,
            specializations: additionalData.specializations || null,
            consultation_rate: additionalData.consultation_rate || null,
            is_verified: false,
          }]);
        
        if (caError) {
          console.error('Error creating CA details:', caError);
          toast.error('Failed to create CA profile details');
          throw caError;
        }
      } else if (role === 'business' && additionalData) {
        const { error: businessError } = await supabase
          .from('business_details')
          .insert([{
            user_id: data.user.id,
            company_name: additionalData.company_name || 'Unknown Company',
            company_size: additionalData.company_size || null,
            industry: additionalData.industry || null,
          }]);
        
        if (businessError) {
          console.error('Error creating Business details:', businessError);
          toast.error('Failed to create Business profile details');
          throw businessError;
        }
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Sign up process error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing in:', error);
        
        let errorMessage = 'Failed to log in';
        if (error.message.includes('credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('too many requests')) {
          errorMessage = 'Too many failed login attempts. Try again later';
        }
        
        toast.error(errorMessage);
        throw error;
      }
      
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to log out');
        throw error;
      }
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout process error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      throw new Error('No authenticated user');
    }
    
    try {
      setLoading(true);
      
      // Update base profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          photo_url: data.photo_url,
          // Don't allow changing email or role through this function
        })
        .eq('id', user.id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error('Failed to update profile');
        throw profileError;
      }
      
      // Update role-specific details
      if (profile?.role === 'ca') {
        if (data.bio || data.consultation_rate || data.specializations) {
          const { error: caError } = await supabase
            .from('ca_details')
            .update({
              bio: data.bio,
              consultation_rate: data.consultation_rate,
              specializations: data.specializations,
            })
            .eq('user_id', user.id);
          
          if (caError) {
            console.error('Error updating CA details:', caError);
            toast.error('Failed to update CA details');
            throw caError;
          }
        }
      } else if (profile?.role === 'business') {
        if (data.company_name || data.company_size || data.industry) {
          const { error: businessError } = await supabase
            .from('business_details')
            .update({
              company_name: data.company_name,
              company_size: data.company_size,
              industry: data.industry,
            })
            .eq('user_id', user.id);
          
          if (businessError) {
            console.error('Error updating Business details:', businessError);
            toast.error('Failed to update Business details');
            throw businessError;
          }
        }
      }
      
      // Update local state
      setProfile((prev) => {
        if (!prev) return null;
        return { ...prev, ...data };
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update process error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        login,
        logout,
        updateProfile,
        session,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};