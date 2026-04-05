import { NextRequest } from 'next/server';
import { createPasswordReset } from '@/lib/backend/auth-service';
import { fail, ok } from '@/lib/backend/response';
import { forgotPasswordSchema } from '@/lib/backend/validation';
import { enforceRateLimit } from '@/lib/backend/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    enforceRateLimit(`forgot-password:${ip}`, 10, 60_000);

    const body = await request.json();
    const parsed = forgotPasswordSchema.parse(body);
    const token = await createPasswordReset(parsed.email);

    return ok(
      {
        email: parsed.email,
        resetToken: token,
      },
      'If an account exists, password reset has been initiated.'
    );
  } catch (error) {
    return fail(error);
  }
}
