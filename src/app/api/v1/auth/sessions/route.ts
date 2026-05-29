import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth } from '@/lib/backend/supabase';
import { getSessions, revokeSessions } from '@/lib/backend/auth-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const sessions = await getSessions(auth.userId);

    return ok({ sessions }, 'Sessions fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json().catch(() => ({}));

    await revokeSessions(auth.userId, body.sessionId);

    return ok({}, 'Session(s) revoked');
  } catch (error) {
    return fail(error);
  }
}
