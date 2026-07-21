/**
 * Dual Supabase Client Configuration
 * 
 * Manages two separate Supabase projects:
 * - Primary: Main data & authentication
 * - Analytics: Logging, analytics, and secondary services
 * 
 * This separation allows for:
 * - Independent scaling
 * - Isolation of concerns
 * - Separate backup strategies
 * - Different retention policies
 * 
 * Note: Using permissive types to work around outdated generated types.
 * Run `npx supabase gen types typescript` to regenerate strict types.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';


type AnyDatabase = any;

// Type for analytics database (can be extended)
interface AnalyticsDatabase {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Record<string, unknown>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      page_views: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          page_path: string;
          referrer: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id: string;
          page_path: string;
          referrer?: string | null;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string;
          page_path?: string;
          referrer?: string | null;
          duration_ms?: number | null;
          created_at?: string;
        };
      };
      error_logs: {
        Row: {
          id: string;
          user_id: string | null;
          error_type: string;
          error_message: string;
          stack_trace: string | null;
          context: Record<string, unknown>;
          severity: 'low' | 'medium' | 'high' | 'critical';
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          error_type: string;
          error_message: string;
          stack_trace?: string | null;
          context?: Record<string, unknown>;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          error_type?: string;
          error_message?: string;
          stack_trace?: string | null;
          context?: Record<string, unknown>;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          resolved?: boolean;
          created_at?: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          metric_name: string;
          metric_value: number;
          dimensions: Record<string, unknown>;
          timestamp: string;
        };
        Insert: {
          id?: string;
          metric_name: string;
          metric_value: number;
          dimensions?: Record<string, unknown>;
          timestamp?: string;
        };
        Update: {
          id?: string;
          metric_name?: string;
          metric_value?: number;
          dimensions?: Record<string, unknown>;
          timestamp?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type SupabaseClientType = 'primary' | 'analytics';

// Environment variables for Primary Supabase (Main App)
const PRIMARY_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PRIMARY_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PRIMARY_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Environment variables for Analytics Supabase (Secondary)
const ANALYTICS_SUPABASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_SUPABASE_URL;
const ANALYTICS_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_ANALYTICS_SUPABASE_ANON_KEY;
const ANALYTICS_SUPABASE_SERVICE_KEY = process.env.ANALYTICS_SUPABASE_SERVICE_ROLE_KEY;

// Singleton instances
let primaryClient: SupabaseClient<AnyDatabase> | null = null;
let analyticsClient: SupabaseClient<AnyDatabase> | null = null;

/**
 * Creates or returns the primary Supabase client
 * Used for all main application data and authentication
 */
export function getPrimaryClient(): SupabaseClient<AnyDatabase> {
  if (!PRIMARY_SUPABASE_URL || !PRIMARY_SUPABASE_ANON_KEY) {
    throw new Error(
      'Primary Supabase credentials are not configured.\n' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  if (!primaryClient) {
    primaryClient = createClient<AnyDatabase>(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return primaryClient;
}

/**
 * Creates or returns the analytics Supabase client
 * Used for logging, analytics, and secondary services
 * Falls back to primary if analytics is not configured
 */
export function getAnalyticsClient(): SupabaseClient<AnyDatabase> {
  // If analytics is not configured, warn and return null
  if (!ANALYTICS_SUPABASE_URL || !ANALYTICS_SUPABASE_ANON_KEY) {
    console.warn(
      'Analytics Supabase is not configured. ' +
      'Analytics features will be disabled. ' +
      'Set NEXT_PUBLIC_ANALYTICS_SUPABASE_URL and NEXT_PUBLIC_ANALYTICS_SUPABASE_ANON_KEY to enable.'
    );
    
    // Return a mock client that logs operations but doesn't fail
    return createMockAnalyticsClient();
  }

  if (!analyticsClient) {
    analyticsClient = createClient<AnyDatabase>(
      ANALYTICS_SUPABASE_URL, 
      ANALYTICS_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false, // No session persistence for analytics
          autoRefreshToken: false,
        },
      }
    );
  }

  return analyticsClient;
}

/**
 * Creates a mock analytics client for when analytics Supabase is not configured
 * This allows the app to function without analytics
 */
function createMockAnalyticsClient(): SupabaseClient<AnyDatabase> {
  const mockResponse = {
    data: null,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  };

  const mockQuery = () => ({
    select: () => mockQuery(),
    insert: () => Promise.resolve(mockResponse),
    update: () => Promise.resolve(mockResponse),
    upsert: () => Promise.resolve(mockResponse),
    delete: () => Promise.resolve(mockResponse),
    eq: () => mockQuery(),
    neq: () => mockQuery(),
    single: () => Promise.resolve(mockResponse),
    order: () => mockQuery(),
    limit: () => mockQuery(),
    range: () => mockQuery(),
    then: (resolve: (value: typeof mockResponse) => void) => Promise.resolve(mockResponse).then(resolve),
  });

  return {
    from: () => mockQuery(),
    rpc: () => Promise.resolve(mockResponse),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => Promise.resolve('ok'),
  } as unknown as SupabaseClient<AnyDatabase>;
}

// Export singleton instances
export const supabasePrimary = typeof window !== 'undefined' ? getPrimaryClient() : null;
export const supabaseAnalytics = typeof window !== 'undefined' ? getAnalyticsClient() : null;

/**
 * Analytics helper functions
 */
export const analytics = {
  /**
   * Log an activity event to the analytics database
   */
  async logActivity(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) {
    const client = getAnalyticsClient();
    
    try {
      await client.from('activity_logs').insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId ?? null,
        metadata: metadata ?? {},
      } as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  /**
   * Track a page view
   */
  async trackPageView(
    sessionId: string,
    pagePath: string,
    userId?: string,
    referrer?: string
  ) {
    const client = getAnalyticsClient();
    
    try {
      await client.from('page_views').insert({
        session_id: sessionId,
        page_path: pagePath,
        user_id: userId ?? null,
        referrer: referrer ?? null,
      } as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  /**
   * Log an error
   */
  async logError(
    errorType: string,
    errorMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, unknown>,
    userId?: string,
    stackTrace?: string
  ) {
    const client = getAnalyticsClient();
    
    try {
      await client.from('error_logs').insert({
        error_type: errorType,
        error_message: errorMessage,
        severity,
        context: context ?? {},
        user_id: userId ?? null,
        stack_trace: stackTrace ?? null,
      } as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  },

  /**
   * Record a metric
   */
  async recordMetric(
    metricName: string,
    metricValue: number,
    dimensions?: Record<string, unknown>
  ) {
    const client = getAnalyticsClient();
    
    try {
      await client.from('metrics').insert({
        metric_name: metricName,
        metric_value: metricValue,
        dimensions: dimensions ?? {},
      } as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  },
};

export default {
  primary: getPrimaryClient,
  analytics: getAnalyticsClient,
  helpers: analytics,
};
