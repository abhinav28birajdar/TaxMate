import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

// Function to create a Supabase client for server components
export async function createServerClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // For development, provide fallback values if env vars are missing
  const url = supabaseUrl || 'https://example-placeholder.supabase.co';
  const anonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
  
  // Only log warnings instead of throwing errors during development
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using placeholder values for development.');
  }
  
  return createClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}