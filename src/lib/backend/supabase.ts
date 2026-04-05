import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { getEnv } from './env';
import { HttpError } from './errors';
import { verifyAccessToken } from './jwt';

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('Missing authorization header', 401, 'UNAUTHORIZED');
  }
  return authHeader.slice(7);
}

export async function requireAuth(request: NextRequest) {
  const token = getBearerToken(request);
  const payload = await verifyAccessToken(token);

  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('id, user_id, is_active, expires_at')
    .eq('id', payload.sessionId)
    .single();

  if (error || !session || !session.is_active) {
    throw new HttpError('Session is invalid', 401, 'SESSION_INVALID');
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    throw new HttpError('Session has expired', 401, 'SESSION_EXPIRED');
  }

  return {
    userId: payload.sub,
    role: payload.role,
    email: payload.email,
    sessionId: payload.sessionId,
  };
}
