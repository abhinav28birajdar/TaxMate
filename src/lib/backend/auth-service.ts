import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { HttpError } from './errors';
import { signAccessToken } from './jwt';
import { supabaseAdmin } from './supabase';

const PASSWORD_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const MAX_FAILED_ATTEMPTS = 5;

function getExpiryDate(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export async function signup(email: string, password: string, name: string) {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    throw new HttpError('Email is already registered', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await hash(password, PASSWORD_ROUNDS);

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name,
      status: 'active',
      is_email_verified: false,
    })
    .select('id, email, name, status')
    .single();

  if (userError || !user) {
    throw new HttpError('Unable to create user', 500, 'USER_CREATE_FAILED');
  }

  await supabaseAdmin.from('profiles').insert({
    user_id: user.id,
    display_name: name,
    is_public: false,
  });

  await supabaseAdmin.from('user_roles').insert({
    user_id: user.id,
    role_key: 'user',
  });

  const emailToken = randomBytes(32).toString('hex');
  await supabaseAdmin.from('sessions').insert({
    user_id: user.id,
    token_hash: emailToken,
    type: 'email_verification',
    expires_at: getExpiryDate(24),
    is_active: true,
  });

  return {
    user,
    verificationToken: emailToken,
  };
}

export async function login(email: string, password: string, ipAddress: string, userAgent: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, password_hash, status, failed_login_attempts, locked_until')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !user) {
    throw new HttpError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    throw new HttpError('Account is locked. Try again later.', 423, 'ACCOUNT_LOCKED');
  }

  const isValid = await compare(password, user.password_hash || '');

  if (!isValid) {
    const failedAttempts = (user.failed_login_attempts || 0) + 1;
    const lockUntil = failedAttempts >= MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null;

    await supabaseAdmin
      .from('users')
      .update({
        failed_login_attempts: failedAttempts,
        locked_until: lockUntil,
      })
      .eq('id', user.id);

    throw new HttpError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const { data: roleRows } = await supabaseAdmin
    .from('user_roles')
    .select('role_key')
    .eq('user_id', user.id)
    .limit(1);

  const role = roleRows?.[0]?.role_key || 'user';

  const sessionToken = randomBytes(48).toString('hex');
  const expiresAt = getExpiryDate(24 * 7);

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: user.id,
      token_hash: sessionToken,
      type: 'auth',
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
      is_active: true,
    })
    .select('id, expires_at')
    .single();

  if (sessionError || !session) {
    throw new HttpError('Unable to create session', 500, 'SESSION_CREATE_FAILED');
  }

  await supabaseAdmin
    .from('users')
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      login_count: (user as any).login_count ? (user as any).login_count + 1 : 1,
    })
    .eq('id', user.id);

  const accessToken = await signAccessToken({
    sub: user.id,
    role,
    sessionId: session.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    },
    accessToken,
    session: {
      id: session.id,
      expiresAt: session.expires_at,
      refreshToken: sessionToken,
    },
  };
}

export async function logout(sessionId: string) {
  await supabaseAdmin.from('sessions').update({ is_active: false }).eq('id', sessionId);
}

export async function createPasswordReset(email: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (!user) {
    return null;
  }

  const token = randomBytes(32).toString('hex');
  await supabaseAdmin.from('sessions').insert({
    user_id: user.id,
    token_hash: token,
    type: 'password_reset',
    expires_at: getExpiryDate(1),
    is_active: true,
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, user_id, expires_at, is_active, type')
    .eq('token_hash', token)
    .eq('type', 'password_reset')
    .maybeSingle();

  if (!session || !session.is_active || new Date(session.expires_at).getTime() < Date.now()) {
    throw new HttpError('Invalid reset token', 400, 'RESET_TOKEN_INVALID');
  }

  const passwordHash = await hash(newPassword, PASSWORD_ROUNDS);

  await supabaseAdmin.from('users').update({ password_hash: passwordHash }).eq('id', session.user_id);
  await supabaseAdmin.from('sessions').update({ is_active: false }).eq('id', session.id);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  const valid = await compare(currentPassword, user?.password_hash || '');
  if (!valid) {
    throw new HttpError('Current password is incorrect', 400, 'PASSWORD_MISMATCH');
  }

  const passwordHash = await hash(newPassword, PASSWORD_ROUNDS);
  await supabaseAdmin.from('users').update({ password_hash: passwordHash }).eq('id', userId);
}
