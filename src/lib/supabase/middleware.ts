import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES, getDashboardPathForRole, normalizeRole } from '@/lib/auth-routing';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Basic route protection
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/ca') || path.startsWith('/client');

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = normalizeRole(user.user_metadata?.role || user.user_metadata?.user_role || null);
    const dashboardPath = getDashboardPathForRole(role);
    const isPublicRoute = PUBLIC_ROUTES.some((route) => (route === '/' ? path === '/' : path === route || path.startsWith(`${route}/`) || path.startsWith(route)));

    if (isPublicRoute && (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/reset-password') || path.startsWith('/verify-email'))) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    if (role === 'CLIENT' && path.startsWith('/ca')) {
      const url = request.nextUrl.clone();
      url.pathname = '/client/dashboard';
      return NextResponse.redirect(url);
    }

    if ((role === 'CA' || role === 'STAFF' || role === 'SUPER_ADMIN') && path.startsWith('/client')) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    if (role !== 'SUPER_ADMIN' && path.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse;
}
