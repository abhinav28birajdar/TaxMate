import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { setup2FA, createAuditLog } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
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

    // Generate 2FA secret and QR code
    const result = await setup2FA(user.email);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to setup 2FA' },
        { status: 500 }
      );
    }

    // Store temporary 2FA secret (will be confirmed on verify)
    await supabase
      .from('users')
      .update({
        two_factor_secret_temp: result.secret,
      })
      .eq('id', authUser.id);

    // Create audit log
    await createAuditLog(authUser.id, '2FA_SETUP_STARTED', 'USER', authUser.id);

    return NextResponse.json(
      {
        success: true,
        message: '2FA setup initiated',
        secret: result.secret,
        qrCode: result.qrCode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
