import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    const [{ data: userRow }, { data: profileRow }] = await Promise.all([
      supabase
        .from('users')
        .select(
          `
          id,
          email,
          name,
          phone,
          role,
          avatar_url,
          status,
          onboarding_completed,
          timezone,
          last_login_at,
          two_factor_enabled,
          locale,
          created_at,
          updated_at
          `
        )
        .eq('id', auth.userId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, avatar_url, onboarding_completed, created_at, updated_at')
        .eq('id', auth.userId)
        .maybeSingle(),
    ]);

    const user = userRow || (profileRow ? {
      id: profileRow.id,
      email: profileRow.email || auth.email,
      name: profileRow.full_name || auth.email,
      phone: profileRow.phone || null,
      role: auth.role,
      avatar_url: profileRow.avatar_url || null,
      status: 'ACTIVE',
      onboarding_completed: profileRow.onboarding_completed ?? false,
      timezone: 'Asia/Kolkata',
      last_login_at: null,
      two_factor_enabled: false,
      locale: 'en-IN',
      created_at: profileRow.created_at,
      updated_at: profileRow.updated_at,
    } : null);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    let roleProfile = null;
    if (auth.role === 'CA') {
      const { data: caProfile } = await supabase
        .from('ca_profiles')
        .select('*')
        .eq('user_id', auth.userId)
        .maybeSingle();

      roleProfile = caProfile;
    } else if (auth.role === 'CLIENT') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', auth.userId)
        .maybeSingle();

      roleProfile = clientProfile;
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          roleProfile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
