/**
 * Supabase Auth Middleware
 * 
 * Handles session refresh and route protection.
 * This middleware runs on every request to ensure auth state is fresh.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/auth/callback',
    '/auth/confirm',
    '/portal/login',
];

// API routes that need auth but are handled separately
const API_ROUTES = ['/api/'];

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase is not configured, allow the request to proceed
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured. Auth middleware disabled.');
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            try {
                                request.cookies.set(name, value);
                                supabaseResponse.cookies.set(name, value, options);
                            } catch (e) {
                                // Silently fail on cookie operations
                                console.debug('Cookie operation failed:', e);
                            }
                        });
                    },
                },
            }
        );

        // IMPORTANT: Do not add any code between createServerClient and getUser()
        // This could cause issues with session refresh

        let user = null;
        try {
            const {
                data: { user: userData },
            } = await supabase.auth.getUser();
            user = userData;
        } catch (error) {
            // Handle abort signals and other auth errors gracefully
            if (error instanceof Error) {
                if (error.message.includes('signal is aborted') || error.name === 'AbortError') {
                    console.debug('Auth request aborted (expected behavior), continuing...');
                } else {
                    console.debug('Auth check error:', error.message);
                }
            }
            // Continue with user as null
        }

        const pathname = request.nextUrl.pathname;

        // Check if it's an API route
        if (API_ROUTES.some(route => pathname.startsWith(route))) {
            // API routes handle their own auth
            return supabaseResponse;
        }

        // Check if it's a public route
        const isPublicRoute = PUBLIC_ROUTES.some(route => {
            if (route === '/') return pathname === '/';
            return pathname.startsWith(route);
        });

        // Check if it's a static asset
        const isStaticAsset = pathname.startsWith('/_next') || 
                              pathname.startsWith('/assets') ||
                              pathname.includes('.');

        if (isStaticAsset) {
            return supabaseResponse;
        }

        // Not authenticated and trying to access protected route
        if (!user && !isPublicRoute) {
            const redirectPath = pathname.startsWith('/portal') ? '/portal/login' : '/login';
            const redirectUrl = new URL(redirectPath, request.url);
            redirectUrl.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // Authenticated user
        if (user) {
            const userRole = user.user_metadata?.role || 'client';

            // Trying to access public auth pages (login, register, portal login)
            if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/portal/login') {
                const redirectTo = request.nextUrl.searchParams.get('redirectTo');
                if (redirectTo && !redirectTo.startsWith('/login') && !redirectTo.startsWith('/register') && !redirectTo.startsWith('/portal/login')) {
                    return NextResponse.redirect(new URL(redirectTo, request.url));
                }
                
                if (userRole === 'client') {
                    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
                } else {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            // Client trying to access CA dashboard (/dashboard/*)
            if (userRole === 'client' && pathname.startsWith('/dashboard')) {
                return NextResponse.redirect(new URL('/portal/dashboard', request.url));
            }

            // CA/Staff trying to access client portal (/portal/*)
            if (userRole !== 'client' && pathname.startsWith('/portal')) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            // CA/Staff attempting to access admin section but is not admin
            if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        return supabaseResponse;
    } catch (error) {
        // Log and safely handle any errors in middleware
        console.error('Middleware error:', error);
        // Return the response to avoid breaking the app
        return supabaseResponse;
    }
}
