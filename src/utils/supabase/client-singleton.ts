/**
 * Supabase Client Singleton
 * 
 * Ensures only one Supabase client instance exists
 * to prevent race conditions with auth locks
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;

export function createClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Return promise if initialization is in progress
  if (clientPromise) {
    return clientPromise;
  }

  // Create new client
  clientPromise = new Promise((resolve) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseClient = createBrowserClient(url, key);
    resolve(supabaseClient);
  });

  return clientPromise;
}

/**
 * Get the current Supabase client without creating a new one
 * Returns null if no client exists
 */
export function getClient(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Reset the client (useful for testing or forced re-initialization)
 */
export function resetClient(): void {
  supabaseClient = null;
  clientPromise = null;
}
