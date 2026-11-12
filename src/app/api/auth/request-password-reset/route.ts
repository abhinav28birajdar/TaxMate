import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { requestPasswordResetSchema } from '@/lib/validators/auth';
import { generateVerificationToken, sendPasswordResetEmail, createAuditLog } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = requestPasswordResetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.data.email.toLowerCase().trim();
    const supabase = getServiceClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    // Never reveal whether the email exists
    if (userError || !user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If the email exists, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    const resetToken = generateVerificationToken();
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await supabase
      .from('verification_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('type', 'PASSWORD_RESET')
      .eq('used', false);

    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        user_id: user.id,
        token: tokenHash,
        type: 'PASSWORD_RESET',
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create reset token' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const emailSent = await sendPasswordResetEmail(user.email, user.name || 'User', resetLink);

    if (emailSent) {
      await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'USER', user.id);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
