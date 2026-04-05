import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAuditLog, invalidateUserSession } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get session token from cookie
    const sessionToken = request.cookies.get('sessionToken')?.value;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Invalidate session token
    if (sessionToken) {
      await invalidateUserSession(sessionToken);
    }

    // Create audit log
    await createAuditLog(user.id, 'LOGOUT', 'USER', user.id, ipAddress);

    // Clear session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    response.cookies.delete('sessionToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
