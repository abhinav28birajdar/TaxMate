/**
 * Supabase Client Index
 * Centralizes all Supabase client exports for clean imports
 */

// Browser/Client-side clients
export { createClient as createBrowserClient, getClient } from './client';

// Server-side clients
export { createServerSupabaseClient } from './server';

// Admin client (service role - server only)
export { supabaseAdmin } from './admin';

// Dual Supabase connections
export { 
  supabasePrimary, 
  supabaseAnalytics,
  getPrimaryClient,
  getAnalyticsClient,
  type SupabaseClientType 
} from './dual-clients';

// Realtime helpers
export {
  subscribeToTable,
  subscribeToPresence,
  subscribeToNotifications,
  subscribeToMessages,
  unsubscribeAll,
} from './realtime';

// Database operations
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  createCase,
  updateCase,
  createNotification,
  logActivity,
} from './operations';
