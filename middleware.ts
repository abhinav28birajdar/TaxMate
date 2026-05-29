import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './src/lib/backend/jwt';
import { extractBearerToken } from './src/lib/backend/jwt';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/v1/auth/signup',
  '/api/v1/auth/login',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
];
const ADMIN_PATHS = ['/admin', '/api/v1/admin', '/api/v1/activity'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Extract token from header or cookie
  let token = req.cookies.get('access_token')?.value;
  if (!token) {
    token = extractBearerToken(req.headers.get('Authorization'));
  }

  if (!token) {
    // Redirect to login if accessing protected page
    if (path.startsWith('/') && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Return 401 for API endpoints
    return new NextResponse(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await verifyAccessToken(token);

    // Check admin paths
    if (ADMIN_PATHS.some(p => path.startsWith(p))) {
      if (!payload.roles?.includes('admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Add user info to headers
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId || '');
    headers.set('x-user-email', (payload.email as string) || '');
    headers.set('x-user-roles', JSON.stringify(payload.roles || []));

    return NextResponse.next({ request: { headers } });
  } catch (error) {
    // Redirect to login on token verification failure
    if (path.startsWith('/') && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return new NextResponse(JSON.stringify({ success: false, message: 'Authentication failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

