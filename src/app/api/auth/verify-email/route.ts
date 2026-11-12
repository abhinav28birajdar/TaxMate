import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { verifyEmailSchema } from '@/lib/validators/auth';
import { createAuditLog } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

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
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = getServiceClient();

    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', tokenHash)
      .eq('type', 'EMAIL_VERIFICATION')
      .maybeSingle();

    if (verificationError || !verificationData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (new Date(verificationData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 400 }
      );
    }

    if (verificationData.used) {
      return NextResponse.json(
        { success: false, error: 'Token has already been used' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'ACTIVE',
        email_verified: true,
        email_verified_at: now,
      })
      .eq('id', verificationData.user_id);

    if (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    await supabase
      .from('verification_tokens')
      .update({ used: true, used_at: now })
      .eq('id', verificationData.id);

    await createAuditLog(
      verificationData.user_id,
      'EMAIL_VERIFIED',
      'USER',
      verificationData.user_id
    );

    await supabase.auth.admin.updateUserById(verificationData.user_id, {
      email_confirm: true,
    });

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
