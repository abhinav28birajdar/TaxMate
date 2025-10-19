import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For development, provide fallback values if env vars are missing
const url = supabaseUrl || 'https://example-placeholder.supabase.co';
const serviceKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-role';

// Only log warnings instead of throwing errors during development
if (!supabaseUrl) {
  console.warn('Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Using placeholder value for development.');
}

if (!supabaseServiceKey) {
  console.warn('Missing environment variable SUPABASE_SERVICE_ROLE_KEY. Using placeholder value for development.');
}

// Create a Supabase client with the service role key for admin operations (server-side only)
export const supabaseAdmin = createClient<Database>(
  url,
  serviceKey
);