import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user from auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: user, error: userError } = await supabase
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
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get role-specific profile if CA
    let roleProfile = null;
    if (user.role === 'CA') {
      const { data: caProfile } = await supabase
        .from('ca_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      roleProfile = caProfile;
    } else if (user.role === 'CLIENT') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

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
