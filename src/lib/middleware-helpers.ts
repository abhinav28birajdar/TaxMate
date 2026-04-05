// lib/middleware-helpers.ts
// Middleware and request handling helpers

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'CA' | 'CLIENT' | 'STAFF' | 'ADMIN';
  iat: number;
  exp: number;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = jwt.verify(token, secret) as AuthPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.reset) {
    rateLimitMap.set(identifier, {
      count: 1,
      reset: now + windowSeconds * 1000,
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/['";]/g, '') // Remove quotes
    .trim();
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate GST number
 */
export function isValidGST(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

/**
 * Validate PAN number
 */
export function isValidPAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+91[0-9]{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
      code: code || `ERROR_${status}`,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Success',
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Check authorization
 */
export function checkAuthorization(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Generate audit log entry
 */
export function createAuditLog(
  userId: string,
  action: string,
  resource: string,
  details: Record<string, any>,
  ipAddress?: string
) {
  return {
    userId,
    action,
    resource,
    details,
    ipAddress: ipAddress || 'UNKNOWN',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate request performance metrics
 */
export function getPerformanceMetrics(startTime: number): {
  duration: number;
  memoryUsed: number;
} {
  const duration = Date.now() - startTime;
  const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;

  return {
    duration,
    memoryUsed: Math.round(memoryUsed * 100) / 100,
  };
}

/**
 * Handle errors with logging
 */
export function handleError(
  error: unknown,
  context: string
): { message: string; status: number } {
  console.error(`Error in ${context}:`, error);

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 400,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}
