import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/backend/response';
import { loginSchema, validateBody } from '@/lib/backend/validation';
import { login } from '@/lib/backend/auth-service';
import { rateLimitPresets } from '@/lib/backend/rate-limit';
import { getIpAddress } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const ip = getIpAddress(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Rate limiting: 5 login attempts per 15 minutes per IP
    if (!rateLimitPresets.authRateLimit(ip)) {
      return errorResponse(
        new Error('Too many login attempts. Please try again later.'),
        'Rate limited'
      );
    }

    // Validate input
    const body = await validateBody(loginSchema, request);

    // Authenticate user
    const result = await login({
      email: body.email,
      password: body.password,
      ipAddress: ip,
      userAgent,
    });

    // Create response with token in body
    const response = successResponse(
      {
        token: result.token,
        sessionId: result.sessionId,
        user: {
          id: result.userId,
          email: result.email,
        },
      },
      'Login successful',
      200
    );

    // Also set HTTP-only cookie for convenience
    response.cookies.set('access_token', result.token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes to match JWT expiry
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : new Error('Login failed'),
      'Login failed'
    );
  }
}
