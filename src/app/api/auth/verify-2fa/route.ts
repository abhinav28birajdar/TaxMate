import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verify2FAToken, createAuditLog } from '@/lib/auth-service';
import { verify2FASchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = verify2FASchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const supabase = createClient();

    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if temporary secret exists
    if (!user.two_factor_secret_temp) {
      return NextResponse.json(
        { success: false, error: '2FA setup not initiated' },
        { status: 400 }
      );
    }

    // Verify 2FA token
    const isValid = verify2FAToken(user.two_factor_secret_temp, token);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: user.two_factor_secret_temp,
        two_factor_secret_temp: null,
      })
      .eq('id', authUser.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog(authUser.id, '2FA_ENABLED', 'USER', authUser.id);

    return NextResponse.json(
      {
        success: true,
        message: '2FA enabled successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
