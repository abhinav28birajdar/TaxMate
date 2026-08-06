/**
 * Supabase Browser Client
 * 
 * This client is used for browser-side operations.
 * It includes authentication persistence and automatic token refresh.
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance
let browserClient: SupabaseClient<Database> | null = null;

// Validate environment variables at startup
if (typeof window !== 'undefined') {
  if (!supabaseUrl || supabaseUrl === '') {
    console.error(
      '⚠️ NEXT_PUBLIC_SUPABASE_URL is missing!\n' +
      'Please add your Supabase project URL to .env.local file.'
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === '') {
    console.error(
      '⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!\n' +
      'Please add your Supabase anon key to .env.local file.'
    );
  }
}

/**
 * Creates or returns the singleton Supabase browser client
 */
export function createClient(): SupabaseClient<Database> {
  const url = (supabaseUrl && supabaseUrl !== '' && !supabaseUrl.includes('PLACEHOLDER')) 
    ? supabaseUrl 
    : 'https://placeholder.supabase.co';

  const key = (supabaseAnonKey && supabaseAnonKey !== '' && !supabaseAnonKey.includes('placeholder')) 
    ? supabaseAnonKey 
    : 'placeholder-anon-key';

  if (!browserClient) {
    browserClient = createSupabaseClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'x-client-info': 'taxmate-web',
        },
      },
    });
  }

  return browserClient;
}

// Legacy exports for backwards compatibility
export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey 
  ? createClient()
  : null;

export function getClient(): SupabaseClient<Database> {
  return createClient();
}

export { type Database };