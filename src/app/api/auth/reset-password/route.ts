import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { hashPassword, createAuditLog } from '@/lib/auth-service';

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
    const supabase = createClient();

    // Find reset token
    const { data: tokenData, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('identifier, expires_at, used')
      .eq('token', token)
      .eq('type', 'PASSWORD_RESET')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (tokenData.used) {
      return NextResponse.json(
        { success: false, error: 'Token has already been used' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        passwordHash: passwordHash,
      })
      .eq('id', tokenData.identifier);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from('verification_tokens')
      .update({ used: true, usedAt: new Date().toISOString() })
      .eq('token', token);

    // Update password in Supabase Auth if exists
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', tokenData.identifier)
      .single();

    if (user?.email) {
      await supabase.auth.admin.updateUserById(tokenData.identifier, {
        password: password,
      });
    }

    // Create audit log
    await createAuditLog(tokenData.identifier, 'PASSWORD_RESET', 'USER', tokenData.identifier);

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
