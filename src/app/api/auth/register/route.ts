import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { registerSchema } from '@/lib/validators/auth';
import {
  hashPassword,
  sendVerificationEmail,
  generateVerificationToken,
  createAuditLog,
} from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
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

    const { password, name, phone, role, icaiNumber, companyName } = validation.data;
    const email = validation.data.email.toLowerCase().trim();
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const supabase = getServiceClient();

    const existingUser = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser.data) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const authUser = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      app_metadata: { role },
      user_metadata: {
        name,
        role,
        phone,
      },
    });

    if (authUser.error) {
      return NextResponse.json(
        { success: false, error: authUser.error.message },
        { status: 400 }
      );
    }

    const userId = authUser.data?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const userInsert = await supabase.from('users').insert([
      {
        id: userId,
        email,
        name,
        phone: phone || null,
        role,
        status: 'PENDING_VERIFICATION',
        password_hash: passwordHash,
        email_verified: false,
      },
    ]);

    if (userInsert.error) {
      console.error('Profile creation error:', userInsert.error);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      phone: phone || null,
      role,
      is_active: true,
    });

    if (role === 'CA') {
      await supabase.from('ca_profiles').insert([
        {
          id: userId,
          user_id: userId,
          icai_membership_number: icaiNumber || null,
          status: 'PENDING',
        },
      ]);
    } else if (role === 'CLIENT') {
      await supabase.from('client_profiles').insert([
        {
          id: userId,
          user_id: userId,
          business_name: companyName || name,
        },
      ]);
    }

    const rawToken = generateVerificationToken();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await supabase.from('verification_tokens').insert([
      {
        user_id: userId,
        token: tokenHash,
        type: 'EMAIL_VERIFICATION',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const verificationLink = `${appUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;
    await sendVerificationEmail(email, name, verificationLink);

    await createAuditLog(userId, 'USER_REGISTERED', 'USER', userId, ipAddress);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
