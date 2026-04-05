import { type NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/documents',
  '/invoices',
  '/tasks',
  '/clients',
  '/team',
  '/analytics',
  '/compliance',
  '/recommended',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth',
];

export async function middleware(request: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();

  const pathname = request.nextUrl.pathname;

  // Clone response to add headers
  let response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Add request ID for tracing
  response.headers.set('X-Request-ID', requestId);

  // Check authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const authToken = request.cookies.get('auth-token')?.value;

    if (!sessionToken && !authToken) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute) {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const authToken = request.cookies.get('auth-token')?.value;

    if (sessionToken || authToken) {
      // User is already authenticated, redirect to dashboard
      if (pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // Log request
  const duration = Date.now() - startTime;
  console.log(`[${requestId}] ${request.method} ${pathname} - ${response.status} (${duration}ms)`);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
