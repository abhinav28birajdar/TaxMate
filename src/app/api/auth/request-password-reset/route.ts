import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requestPasswordResetSchema } from '@/lib/validators/auth';
import { generateVerificationToken, sendPasswordResetEmail, createAuditLog } from '@/lib/auth-service';

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

    const { email } = validation.data;
    const supabase = createClient();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    // Don't reveal if email exists or not (security)
    if (userError || !user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If the email exists, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        identifier: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create reset token' },
        { status: 500 }
      );
    }

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetLink);

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
