import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { unauthorized } from './errors';
import { verifyAccessToken, JWTPayload, extractBearerToken } from './jwt';

let serviceClient: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (serviceClient) {
    return serviceClient;
  }

  serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}

export function getServiceClient(): SupabaseClient {
  return createServiceClient();
}

export async function authGuard(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    throw unauthorized('Missing or invalid authorization header');
  }

  try {
    const payload = await verifyAccessToken(token);

    // Verify session is still active
    const client = getServiceClient();
    const { data: session, error } = await client
      .from('sessions')
      .select('id, is_active, expires_at')
      .eq('id', payload.sessionId)
      .eq('user_id', payload.userId)
      .single();

    if (error || !session) {
      throw unauthorized('Session not found');
    }

    if (!session.is_active) {
      throw unauthorized('Session is inactive');
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw unauthorized('Session has expired');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    throw unauthorized('Authentication failed');
  }
}

export async function getUserFromRequest(request: Request): Promise<JWTPayload> {
  return authGuard(request);
}
