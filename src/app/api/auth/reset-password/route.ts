import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { hashPassword, createAuditLog } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = getServiceClient();

    const { data: tokenData, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', tokenHash)
      .in('type', ['PASSWORD_RESET', 'password_reset'])
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 400 }
      );
    }

    if (tokenData.used) {
      return NextResponse.json(
        { success: false, error: 'Token has already been used' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: now,
      })
      .eq('id', tokenData.user_id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    await supabase
      .from('verification_tokens')
      .update({ used: true, used_at: now })
      .eq('id', tokenData.id);

    await supabase.auth.admin.updateUserById(tokenData.user_id, {
      password,
    });

    await createAuditLog(tokenData.user_id, 'PASSWORD_RESET', 'USER', tokenData.user_id);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
