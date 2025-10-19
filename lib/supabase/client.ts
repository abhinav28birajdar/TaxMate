import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For development, provide fallback values if env vars are missing
const url = supabaseUrl || 'https://example-placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Only log warnings instead of throwing errors during development
if (!supabaseUrl) {
  console.warn('Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Using placeholder value for development.');
}

if (!supabaseAnonKey) {
  console.warn('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Using placeholder value for development.');
}

export const supabase = createClient<Database>(url, anonKey);