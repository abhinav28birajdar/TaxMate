/**
 * Authentication & Authorization middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { errorResponse, ApiError, ERROR_CODES, HTTP_STATUS } from './response';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
);

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Extract and verify JWT token from request
 */
export async function verifyAuth(request: NextRequest): Promise<DecodedToken> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid authorization header', {
      code: ERROR_CODES.UNAUTHORIZED,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as DecodedToken;
  } catch (error) {
    throw new ApiError('Invalid or expired token', {
      code: ERROR_CODES.UNAUTHORIZED,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  }
}

/**
 * Check if user has required role
 */
export function requireRole(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new ApiError('Insufficient permissions', {
      code: ERROR_CODES.FORBIDDEN,
      statusCode: HTTP_STATUS.FORBIDDEN,
    });
  }
}

/**
 * Generic API request handler with auth/validation
 */
export async function handleApiRequest<T>(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: DecodedToken
  ) => Promise<T>,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requireAuth?: boolean;
    allowedRoles?: string[];
  }
): Promise<NextResponse> {
  try {
    // Check HTTP method
    if (options?.method && request.method !== options.method) {
      throw new ApiError(`Method ${request.method} not allowed`, {
        code: 'METHOD_NOT_ALLOWED',
        statusCode: 405,
      });
    }

    // Verify authentication if required
    let user: DecodedToken | null = null;
    if (options?.requireAuth !== false) {
      user = await verifyAuth(request);

      // Check role permissions
      if (options?.allowedRoles) {
        requireRole(user.role, options.allowedRoles);
      }
    }

    // Execute handler
    const data = await handler(request, user!);

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: 'Request successful',
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle known errors
    if (error instanceof ApiError) {
      return NextResponse.json(
        errorResponse('Request failed', error, error.statusCode),
        { status: error.statusCode }
      );
    }

    // Handle validation errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        errorResponse('Invalid request body', error, HTTP_STATUS.BAD_REQUEST),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Handle unknown errors
    console.error('API Error:', error);
    const unknownError = new ApiError('Internal server error', {
      code: ERROR_CODES.DATABASE_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_ERROR,
    });

    return NextResponse.json(
      errorResponse('Internal server error', unknownError),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}

/**
 * Rate limiting function
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => {
  cleanupRateLimits();
}, 5 * 60 * 1000);
