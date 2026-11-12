import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { profileSchema } from '@/lib/backend/validation';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { getProfile, updateProfile } from '@/lib/backend/profile-service';
import { logActivity } from '@/lib/backend/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const [{ data: user, error: userError }, profile] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, email, name, avatar_url, email_verified, role, status')
        .eq('id', auth.userId)
        .maybeSingle(),
      getProfile(auth.userId),
    ]);

    if (userError) {
      throw userError;
    }

    return ok({ user, profile }, 'Profile fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = profileSchema.parse(body);

    const profile = await updateProfile(auth.userId, parsed);

    await logActivity({
      userId: auth.userId,
      action: 'profile_updated',
      resourceType: 'profile',
      resourceId: auth.userId,
    });

    return ok({ profile }, 'Profile updated');
  } catch (error) {
    return fail(error);
  }
}
