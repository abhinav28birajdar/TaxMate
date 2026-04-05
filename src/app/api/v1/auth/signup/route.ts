import { NextRequest } from 'next/server';
import { signupSchema } from '@/lib/backend/validation';
import { fail, ok } from '@/lib/backend/response';
import { signup } from '@/lib/backend/auth-service';
import { enforceRateLimit } from '@/lib/backend/rate-limit';
import { writeAuditLog } from '@/lib/backend/audit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    enforceRateLimit(`signup:${ip}`, 10, 60_000);

    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const result = await signup(parsed.email, parsed.password, parsed.name);

    await writeAuditLog({
      userId: result.user.id,
      action: 'AUTH_SIGNUP',
      entityType: 'user',
      entityId: result.user.id,
      ipAddress: ip,
      metadata: { email: result.user.email },
    });

    return ok(
      {
        user: result.user,
        verificationToken: result.verificationToken,
      },
      'Signup successful',
      201
    );
  } catch (error) {
    return fail(error);
  }
}
