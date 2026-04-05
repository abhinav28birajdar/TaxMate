import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { loginSchema } from '@/lib/validators/auth';
import { verifyPassword, createUserSession, createAuditLog } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
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

    const { email, password, rememberMe } = validation.data;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const supabase = createClient();

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is not active. Please verify your email.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      // Log failed attempt
      await createAuditLog(user.id, 'LOGIN_FAILED', 'USER', user.id, ipAddress);

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createUserSession(user.id, ipAddress);

    // Update last login
    await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: user.login_count + 1,
      })
      .eq('id', user.id);

    // Create audit log
    await createAuditLog(user.id, 'LOGIN_SUCCESS', 'USER', user.id, ipAddress);

    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatar_url,
          onboardingCompleted: user.onboarding_completed,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
          expires_in: authData.session?.expires_in,
        },
      },
      { status: 200 }
    );

    // Set session cookie if remember me is selected
    if (rememberMe && sessionToken) {
      response.cookies.set('sessionToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
