import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import * as Sentry from '@sentry/nextjs';

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
});

export function createProtectedHandler(
    handler: (req: NextRequest, ctx: { userId: string; userRole: string; session: any }) => Promise<NextResponse>,
    options: {
        roles?: string[];
        rateLimit?: boolean;
        permission?: string;
    } = {}
) {
    return async (req: NextRequest, routeContext?: any) => {
        try {
            // Rate limiting
            if (options.rateLimit !== false) {
                const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
                const { success } = await ratelimit.limit(ip);
                if (!success) {
                    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
                }
            }

            // Auth check
            const supabase = await createClient();
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Get user role from custom users table
            const { data: userProfile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const userRole = userProfile?.role || session.user.user_metadata?.role || 'CLIENT';

            // Role check
            if (options.roles && !options.roles.includes(userRole)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            return await handler(req, {
                userId: session.user.id,
                userRole,
                session,
            });
        } catch (error) {
            Sentry.captureException(error);
            console.error('[API Error]', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}
