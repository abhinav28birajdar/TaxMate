import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { registerSchema } from '@/lib/validators/auth';
import {
  hashPassword,
  sendVerificationEmail,
  generateVerificationToken,
  createAuditLog,
} from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
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

    const { email, password, name, phone, role, icaiNumber, companyName } = validation.data;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const supabase = await createClient();

    // Check if user already exists
    const existingUser = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser.data) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in Supabase Auth
    const authUser = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
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

    // Create user profile in database
    const profileData: any = {
      id: userId,
      email,
      name,
      phone,
      role: role,
      status: 'PENDING_VERIFICATION',
      password_hash: passwordHash,
      email_verified: false,
    };

    const userInsert = await supabase
      .from('users')
      .insert([profileData]);

    if (userInsert.error) {
      console.error('Profile creation error:', userInsert.error);
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Create role-specific profile
    if (role === 'CA' && icaiNumber) {
      await supabase
        .from('ca_profiles')
        .insert([{
          id: userId,
          user_id: userId,
          icai_membership_number: icaiNumber,
          status: 'PENDING',
        }]);
    } else if (role === 'CLIENT' && companyName) {
      await supabase
        .from('client_profiles')
        .insert([{
          id: userId,
          user_id: userId,
          business_name: companyName,
        }]);
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    await supabase
      .from('verification_tokens')
      .insert([{
        user_id: userId,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }]);

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, name, verificationLink);

    // Create audit log
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
