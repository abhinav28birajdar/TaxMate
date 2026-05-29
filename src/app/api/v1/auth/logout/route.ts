import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/backend/response';
import { authGuard } from '@/lib/backend/supabase';
import { logout } from '@/lib/backend/auth-service';
import { logActivity } from '@/lib/backend/audit';
import { getIpAddress } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await authGuard(request);
    const ip = getIpAddress(request);

    // Logout user
    await logout(user.userId, user.sessionId);

    return successResponse(
      { message: 'Logout successful' },
      'Logged out successfully',
      200
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : new Error('Logout failed'),
      'Logout failed'
    );
  }
}
