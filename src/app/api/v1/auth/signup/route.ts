import { NextRequest } from 'next/server';
import { signupSchema, validateBody } from '@/lib/backend/validation';
import { errorResponse, successResponse } from '@/lib/backend/response';
import { signup } from '@/lib/backend/auth-service-new';
import { rateLimitPresets } from '@/lib/backend/rate-limit';
import { getIpAddress } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const ip = getIpAddress(request);

    // Rate limiting: 5 signup attempts per 15 minutes per IP
    if (!rateLimitPresets.signupRateLimit(ip)) {
      return errorResponse(
        new Error('Too many signup attempts. Please try again in 15 minutes.'),
        'Rate limit exceeded'
      );
    }

    // Validate input
    const body = await validateBody(signupSchema, request);

    // Register user
    const result = await signup({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
    });

    return successResponse(
      {
        userId: result.userId,
        email: result.email,
      },
      'Account created successfully',
      201
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : new Error('Signup failed'),
      'Signup failed'
    );
  }
}
