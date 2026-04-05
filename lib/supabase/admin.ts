/**
 * Supabase Admin Client (Server-side Only)
 * 
 * Uses the service role key for privileged operations.
 * WARNING: Never expose this client to the browser!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instance
let adminClient: SupabaseClient<Database> | null = null;

// Validate we're on the server
if (typeof window !== 'undefined') {
  console.error(
    '❌ CRITICAL SECURITY ERROR: Admin client should never be used in the browser!\n' +
    'This exposes the service role key which has full database access.'
  );
}

/**
 * Creates or returns the Supabase admin client
 * Uses the service role key for admin operations
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Admin client cannot be used in the browser. ' +
      'Use the regular client or server client instead.'
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase admin credentials are not configured. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

// Create admin client only on server
export const supabaseAdmin = typeof window === 'undefined' && supabaseUrl && supabaseServiceKey
  ? getAdminClient()
  : null;

/**
 * Admin operations that bypass RLS
 */
export const adminOperations = {
  /**
   * Get user by email (admin only)
   */
  async getUserByEmail(email: string) {
    const client = getAdminClient();
    return client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: 'ca' | 'client' | 'firm' | 'admin') {
    const client = getAdminClient();
    return client
      .from('users')
      .update({ role })
      .eq('id', userId);
  },

  /**
   * Suspend user (admin only)
   */
  async suspendUser(userId: string, reason?: string) {
    const client = getAdminClient();
    return client
      .from('users')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  /**
   * Verify CA profile (admin only)
   */
  async verifyCA(caProfileId: string, verifiedBy: string) {
    const client = getAdminClient();
    return client
      .from('ca_profiles')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
      })
      .eq('id', caProfileId);
  },

  /**
   * Create notification for user (system)
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'system'
  ) {
    const client = getAdminClient();
    return client
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
      });
  },

  /**
   * Get all users (admin dashboard)
   */
  async getAllUsers(options?: { limit?: number; offset?: number; role?: string }) {
    const client = getAdminClient();
    let query = client.from('users').select('*', { count: 'exact' });
    
    if (options?.role) {
      query = query.eq('role', options.role);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }
    
    return query;
  },

  /**
   * Get platform statistics (admin dashboard)
   */
  async getPlatformStats() {
    const client = getAdminClient();
    
    const [users, cas, clients, cases, revenue] = await Promise.all([
      client.from('users').select('*', { count: 'exact', head: true }),
      client.from('ca_profiles').select('*', { count: 'exact', head: true }),
      client.from('client_profiles').select('*', { count: 'exact', head: true }),
      client.from('cases').select('*', { count: 'exact', head: true }),
      client.from('payments').select('amount').eq('status', 'completed'),
    ]);

    const totalRevenue = revenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      totalUsers: users.count || 0,
      totalCAs: cas.count || 0,
      totalClients: clients.count || 0,
      totalCases: cases.count || 0,
      totalRevenue,
    };
  },
};

export default {
  getAdminClient,
  ...adminOperations,
};