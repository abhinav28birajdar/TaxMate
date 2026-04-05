import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { profileSchema } from '@/lib/backend/validation';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { writeActivityLog } from '@/lib/backend/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, is_email_verified')
      .eq('id', auth.userId)
      .single();

    if (userError) {
      throw userError;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (profileError) {
      throw profileError;
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

    if (parsed.name) {
      await supabaseAdmin.from('users').update({ name: parsed.name }).eq('id', auth.userId);
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        bio: parsed.bio,
        avatar_url: parsed.profileImageUrl,
        social_links: parsed.socialLinks,
        is_public: parsed.isPublic,
      })
      .eq('user_id', auth.userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await writeActivityLog({
      userId: auth.userId,
      action: 'Profile updated',
      category: 'profile',
    });

    return ok({ profile: data }, 'Profile updated');
  } catch (error) {
    return fail(error);
  }
}
