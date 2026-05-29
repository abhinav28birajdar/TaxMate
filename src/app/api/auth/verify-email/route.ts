import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyEmailSchema } from '@/lib/validators/auth';
import { createAuditLog } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = verifyEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const supabase = await createClient();

    // Find verification token
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_tokens')
      .select('identifier, expires_at, used')
      .eq('token', token)
      .eq('type', 'EMAIL_VERIFICATION')
      .single();

    if (verificationError || !verificationData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(verificationData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (verificationData.used) {
      return NextResponse.json(
        { success: false, error: 'Token has already been used' },
        { status: 400 }
      );
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      })
      .eq('id', verificationData.identifier);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from('verification_tokens')
      .update({ used: true, usedAt: new Date().toISOString() })
      .eq('token', token);

    // Create audit log
    await createAuditLog(
      verificationData.identifier,
      'EMAIL_VERIFIED',
      'USER',
      verificationData.identifier
    );

    // Confirm email in Supabase Auth
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', verificationData.identifier)
      .single();

    if (user?.email) {
      await supabase.auth.admin.updateUserById(verificationData.identifier, {
        email_confirm: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
