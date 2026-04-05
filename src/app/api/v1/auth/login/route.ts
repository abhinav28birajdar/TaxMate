import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { loginSchema } from '@/lib/backend/validation';
import { login } from '@/lib/backend/auth-service';
import { enforceRateLimit } from '@/lib/backend/rate-limit';
import { writeAuditLog, writeActivityLog } from '@/lib/backend/audit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    enforceRateLimit(`login:${ip}`, 15, 60_000);

    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const result = await login(parsed.email, parsed.password, ip, userAgent);

    await Promise.all([
      writeAuditLog({
        userId: result.user.id,
        action: 'AUTH_LOGIN',
        entityType: 'session',
        entityId: result.session.id,
        ipAddress: ip,
      }),
      writeActivityLog({
        userId: result.user.id,
        action: 'User logged in',
        category: 'auth',
      }),
    ]);

    return ok(result, 'Login successful', 200);
  } catch (error) {
    return fail(error);
  }
}
