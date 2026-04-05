import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and password required' },
        { status: 400 }
      );
    }

    // Find token
    const { data: resetToken } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', 'password_reset')
      .single();

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetToken.user_id);

    // Delete token
    await supabase.from('verification_tokens').delete().eq('id', resetToken.id);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
