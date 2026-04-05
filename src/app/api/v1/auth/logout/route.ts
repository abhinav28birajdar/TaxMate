import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth } from '@/lib/backend/supabase';
import { logout } from '@/lib/backend/auth-service';
import { writeAuditLog } from '@/lib/backend/audit';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await logout(auth.sessionId);

    await writeAuditLog({
      userId: auth.userId,
      action: 'AUTH_LOGOUT',
      entityType: 'session',
      entityId: auth.sessionId,
      ipAddress: request.headers.get('x-forwarded-for'),
    });

    return ok({ sessionId: auth.sessionId }, 'Logout successful');
  } catch (error) {
    return fail(error);
  }
}
