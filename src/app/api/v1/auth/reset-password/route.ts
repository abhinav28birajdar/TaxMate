import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { resetPasswordSchema } from '@/lib/backend/validation';
import { resetPassword } from '@/lib/backend/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.parse(body);

    await resetPassword(parsed.token, parsed.newPassword);

    return ok({}, 'Password reset successful');
  } catch (error) {
    return fail(error);
  }
}
