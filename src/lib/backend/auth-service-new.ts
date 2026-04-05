import { hashSync, compareSync } from 'bcryptjs';
import { createHash } from 'crypto';
import { getServiceClient } from './supabase';
import { signAccessToken } from './jwt';
import { env } from './env';
import { conflict, unauthorized, notFound, internalError } from './errors';
import { logActivity } from './audit';

interface SignupData {
  email: string;
  password: string;
  fullName?: string;
}

interface LoginData {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuthResult {
  userId: string;
  email: string;
  fullName?: string;
  token: string;
  sessionId: string;
}

function hashPassword(password: string): string {
  return hashSync(password, env.BCRYPT_SALT_ROUNDS);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function signup(data: SignupData): Promise<{ userId: string; email: string }> {
  const client = getServiceClient();
  const emailLower = data.email.toLowerCase();

  // Check if email already exists
  const { data: existing, error: checkError } = await client
    .from('users')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle();

  if (checkError) {
    throw internalError('Database error during signup');
  }

  if (existing) {
    throw conflict('Email already registered');
  }

  const passwordHash = hashPassword(data.password);

  // Create user
  const { data: user, error: userError } = await client
    .from('users')
    .insert({
      email: emailLower,
      password_hash: passwordHash,
    })
    .select('id, email')
    .single();

  if (userError || !user) {
    throw internalError('Failed to create user account');
  }

  // Create profile
  const { error: profileError } = await client
    .from('profiles')
    .insert({
      user_id: user.id,
      full_name: data.fullName,
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  // Create onboarding record
  const { error: onboardingError } = await client
    .from('onboarding_data')
    .insert({
      user_id: user.id,
      current_step: 1,
      total_steps: 5,
    });

  if (onboardingError) {
    console.error('Onboarding creation error:', onboardingError);
  }

  // Create user settings
  const { error: settingsError } = await client
    .from('user_settings')
    .insert({
      user_id: user.id,
    });

  if (settingsError) {
    console.error('Settings creation error:', settingsError);
  }

  // Assign user role
  const { data: userRole } = await client
    .from('roles')
    .select('id')
    .eq('name', 'user')
    .single();

  if (userRole) {
    const { error: roleError } = await client
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: userRole.id,
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
    }
  }

  // Log activity
  await logActivity(user.id, 'signup', 'user', user.id);

  return {
    userId: user.id,
    email: user.email,
  };
}

export async function login(data: LoginData): Promise<AuthResult> {
  const client = getServiceClient();
  const emailLower = data.email.toLowerCase();

  // Find user
  const { data: user, error: userError } = await client
    .from('users')
    .select('id, email, password_hash, is_active, is_locked, locked_until, failed_login_attempts')
    .eq('email', emailLower)
    .maybeSingle();

  if (userError || !user) {
    throw unauthorized('Invalid credentials');
  }

  if (!user.is_active) {
    throw unauthorized('Account is inactive');
  }

  // Check if account is locked
  if (user.is_locked && user.locked_until) {
    const lockedUntil = new Date(user.locked_until);
    if (lockedUntil > new Date()) {
      throw unauthorized('Account is temporarily locked. Try again later.');
    }
  }

  // Verify password
  const isPasswordValid = compareSync(data.password, user.password_hash || '');

  if (!isPasswordValid) {
    const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
    const shouldLock = newFailedAttempts >= 5;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null;

    await client
      .from('users')
      .update({
        failed_login_attempts: newFailedAttempts,
        is_locked: shouldLock,
        locked_until: lockedUntil,
      })
      .eq('id', user.id);

    throw unauthorized('Invalid credentials');
  }

  // Reset failed attempts and lock status
  await client
    .from('users')
    .update({
      failed_login_attempts: 0,
      is_locked: false,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // Get user roles
  const { data: userRoles } = await client
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id);

  const roles = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || ['user'];

  // Create session
  const sessionToken = await crypto.getRandomValues(new Uint8Array(32));
  const sessionTokenHex = Array.from(sessionToken)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const tokenHash = hashToken(sessionTokenHex);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { data: session, error: sessionError } = await client
    .from('sessions')
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      expires_at: expiresAt,
      is_active: true,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    throw internalError('Failed to create session');
  }

  // Sign JWT
  const token = await signAccessToken({
    userId: user.id,
    email: user.email,
    roles,
    sessionId: session.id,
  });

  // Log activity
  await logActivity(user.id, 'login', 'session');

  // Get profile for full name
  const { data: profile } = await client
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email,
    fullName: profile?.full_name,
    token,
    sessionId: session.id,
  };
}

export async function logout(userId: string, sessionId: string): Promise<void> {
  const client = getServiceClient();

  const { error } = await client
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Logout error:', error);
  }

  await logActivity(userId, 'logout', 'session');
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const client = getServiceClient();

  // Get current password hash
  const { data: user, error: userError } = await client
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw notFound('User');
  }

  // Verify current password
  if (!compareSync(currentPassword, user.password_hash || '')) {
    throw unauthorized('Current password is incorrect');
  }

  // Hash new password
  const newPasswordHash = hashPassword(newPassword);

  // Update password
  const { error: updateError } = await client
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);

  if (updateError) {
    throw internalError('Failed to update password');
  }

  // Invalidate all other sessions
  await client
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', userId);

  await logActivity(userId, 'change_password', 'user');
}

export async function getSessions(userId: string): Promise<any[]> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('sessions')
    .select('id, is_active, created_at, ip_address, user_agent')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw internalError('Failed to fetch sessions');
  }

  return data || [];
}

export async function revokeSessions(userId: string, sessionId?: string): Promise<void> {
  const client = getServiceClient();

  if (sessionId) {
    const { error } = await client
      .from('sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      throw internalError('Failed to revoke session');
    }
  } else {
    const { error } = await client
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      throw internalError('Failed to revoke sessions');
    }
  }
}
