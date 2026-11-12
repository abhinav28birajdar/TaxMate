import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();
    const { token, newPassword, currentPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (token) {
      const tokenHash = createHash('sha256').update(String(token)).digest('hex');
      const { data: resetToken } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', tokenHash)
        .in('type', ['PASSWORD_RESET', 'password_reset'])
        .maybeSingle();

      if (!resetToken || resetToken.used) {
        return NextResponse.json(
          { success: false, error: 'Invalid or already used token' },
          { status: 400 }
        );
      }

      if (new Date(resetToken.expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Token expired' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await supabase
        .from('users')
        .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', resetToken.user_id);

      await supabase.auth.admin.updateUserById(resetToken.user_id, { password: newPassword });

      await supabase
        .from('verification_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', resetToken.id);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    }

    // Authenticated password update path
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: token or session required' },
        { status: 401 }
      );
    }

    if (currentPassword) {
      const { data: userRow } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', auth.userId)
        .maybeSingle();

      if (userRow?.password_hash) {
        const matches = await bcrypt.compare(String(currentPassword), userRow.password_hash);
        if (!matches) {
          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 }
          );
        }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('users')
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', auth.userId);

    await supabase.auth.admin.updateUserById(auth.userId, { password: newPassword });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
