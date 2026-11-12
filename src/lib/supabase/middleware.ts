import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getDashboardPathForRole, normalizeRole, isPublicPath, isCaProtectedPath } from '@/lib/auth-routing';

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

  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (err) {
    console.debug('Middleware auth check skipped/failed:', err);
  }

  // Basic route protection
  const path = request.nextUrl.pathname;

  // CA Practice OS internal modules (including legacy top-level CA routes)
  const isCaPracticeOs = isCaProtectedPath(path);
  const isClientPortal = (path.startsWith('/client') || (path.startsWith('/portal') && path !== '/portal/login'));
  const isAdminConsole = path.startsWith('/admin') && path !== '/admin/login';

  const isProtectedRoute = isAdminConsole || isCaPracticeOs || isClientPortal;

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminConsole ? '/admin/login' : path.startsWith('/portal') ? '/portal/login' : '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const rawRole = user.app_metadata?.role || user.app_metadata?.user_role || user.user_metadata?.role || null;
    const role = normalizeRole(rawRole);
    const dashboardPath = getDashboardPathForRole(role);
    const isPublicRoute = isPublicPath(path);

    if (isPublicRoute && (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/reset-password') || path.startsWith('/verify-email') || path === '/portal/login' || path === '/admin/login')) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    if (role === 'CLIENT' && isCaPracticeOs) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    if ((role === 'CA' || role === 'STAFF') && (path.startsWith('/client') || path.startsWith('/portal'))) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    // Strict check: ADMIN privileges must be enforced via app_metadata or verified profile, never self-assigned
    const adminMetadataRole = normalizeRole(user.app_metadata?.role || user.app_metadata?.user_role || null);
    if (adminMetadataRole !== 'SUPER_ADMIN' && isAdminConsole) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse;
}
