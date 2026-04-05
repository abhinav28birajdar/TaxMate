import { NextRequest } from 'next/server';
import { changePasswordSchema } from '@/lib/backend/validation';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth } from '@/lib/backend/supabase';
import { changePassword } from '@/lib/backend/auth-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = changePasswordSchema.parse(body);

    await changePassword(auth.userId, parsed.currentPassword, parsed.newPassword);

    return ok({}, 'Password changed successfully');
  } catch (error) {
    return fail(error);
  }
}
