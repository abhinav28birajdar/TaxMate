import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { env } from './env'
import { AppError, conflict, unauthorized, notFound, internalError } from './errors'
import { signAccessToken } from './jwt'
import { logActivity } from './audit'

let _supabaseAdmin: any = null;
const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Backend auth service cannot run in browser runtime.');
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL ?? '', env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  }
  return _supabaseAdmin;
};

const supabaseAdmin = new Proxy({} as any, {
  get(target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver);
  }
});

export interface SignupInput {
  email: string
  password: string
  fullName?: string
}

export interface LoginInput {
  email: string
  password: string
  deviceInfo?: string
  ipAddress: string
  userAgent?: string
}

export interface AuthResult {
  userId: string
  email: string
  token?: string
  sessionId?: string
}

/**
 * Signup: Create new user account
 */
export async function signup(input: SignupInput): Promise<AuthResult> {
  try {
    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', input.email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      throw conflict('Email already registered')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: input.email.toLowerCase(),
        password_hash: passwordHash,
        name: input.fullName || 'User',
        email_verified: false,
        status: 'PENDING_VERIFICATION',
        role: 'CLIENT',
      })
      .select()
      .single()

    if (userError || !user) {
      console.error('User creation error:', userError)
      throw internalError('Failed to create user')
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
      user_id: user.id,
      display_name: input.fullName || 'User',
      is_public: false,
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create onboarding data
    const { error: onboardError } = await supabaseAdmin.from('onboarding_data').insert({
      user_id: user.id,
      current_step: 1,
      basic_info: {},
      preferences: {},
      interests: [],
      is_completed: false,
    })

    if (onboardError) {
      console.error('Onboarding data creation error:', onboardError)
    }

    // Create user settings
    const { error: settingsError } = await supabaseAdmin.from('settings').insert({
      user_id: user.id,
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
      email_notifications: true,
      push_notifications: true,
    })

    if (settingsError) {
      console.error('User settings creation error:', settingsError)
    }

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'user_signup',
      ipAddress: '0.0.0.0',
    })

    return {
      userId: user.id,
      email: user.email,
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Signup failed')
  }
}

/**
 * Login: Authenticate user and create session
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  try {
    // Fetch user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', input.email.toLowerCase())
      .maybeSingle()

    if (userError || !user) {
      throw unauthorized('Invalid credentials')
    }

    // Check if account is suspended/banned
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new AppError('Account is banned or suspended', 423, 'ACCOUNT_LOCKED')
    }

    // Verify password
    const passwordValid = await bcrypt.compare(input.password, user.password_hash)

    if (!passwordValid) {
      throw unauthorized('Invalid credentials')
    }

    const roles = [user.role || 'CLIENT']

    // Create session
    const tokenHash = await bcrypt.hash(Math.random().toString(), 10)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        ip_address: input.ipAddress,
        user_agent: input.userAgent || null,
        expires_at: expiresAt.toISOString(),
        active: true,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('Session creation error:', sessionError)
      throw internalError('Failed to create session')
    }

    // Sign JWT
    const token = await signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
      sessionId: session.id,
    })

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'user_login',
      ipAddress: input.ipAddress,
      metadata: { sessionId: session.id },
    })

    return {
      userId: user.id,
      email: user.email,
      token,
      sessionId: session.id,
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Login failed')
  }
}

/**
 * Logout: Revoke session
 */
export async function logout(userId: string, sessionId?: string): Promise<void> {
  try {
    if (sessionId) {
      // Revoke specific session
      await supabaseAdmin
        .from('user_sessions')
        .update({ active: false })
        .eq('id', sessionId)
        .eq('user_id', userId)
    } else {
      // Revoke all sessions
      await supabaseAdmin
        .from('user_sessions')
        .update({ active: false })
        .eq('user_id', userId)
        .eq('active', true)
    }

    // Log activity
    await logActivity({
      userId,
      action: 'user_logout',
      metadata: sessionId ? { sessionId } : { allSessions: true },
    })
  } catch (error) {
    console.error('Logout error:', error)
    throw internalError('Logout failed')
  }
}

/**
 * Create Password Reset: Generate hashed reset token and dispatch email if configured.
 * Never logs or stores plaintext reset tokens.
 */
export async function createPasswordReset(email: string): Promise<string> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name, metadata')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!user) {
      // Don't reveal if email exists - silent success for security
      return 'password-reset-sent'
    }

    const resetToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    const existingMeta = (user.metadata && typeof user.metadata === 'object') ? user.metadata : {}

    await supabaseAdmin
      .from('users')
      .update({
        metadata: {
          ...existingMeta,
          reset_token_hash: tokenHash,
          reset_token_expires_at: expiresAt.toISOString(),
        },
      })
      .eq('id', user.id)

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'TaxMate <noreply@taxmate.in>',
          to: [user.email],
          subject: 'Reset your TaxMate password',
          html: `<p>Hello ${user.name || 'User'},</p><p>Use the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">Reset Password</a></p>`,
        })
      } catch (emailErr) {
        console.warn('Password reset email dispatch skipped/failed:', emailErr)
      }
    }

    await logActivity({
      userId: user.id,
      action: 'password_reset_requested',
    })

    return 'password-reset-sent'
  } catch (error) {
    console.error('Forgot password error:', error)
    throw internalError('Failed to process password reset request')
  }
}

/**
 * Reset Password: Verify SHA-256 token hash and update password
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    if (!token || token.length < 16) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    const candidateHash = createHash('sha256').update(token).digest('hex')
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, metadata')
      .not('metadata', 'is', null)

    let matchedUser: any = null
    const candidateBuf = new Uint8Array(Buffer.from(candidateHash, 'utf8'))
    for (const u of users || []) {
      const meta = (u.metadata && typeof u.metadata === 'object') ? (u.metadata as Record<string, any>) : null
      const storedHash = typeof meta?.reset_token_hash === 'string' ? meta.reset_token_hash : ''
      if (!storedHash || storedHash.length !== candidateHash.length) continue
      const storedBuf = new Uint8Array(Buffer.from(storedHash, 'utf8'))
      if (timingSafeEqual(storedBuf, candidateBuf)) {
        if (meta?.reset_token_expires_at && new Date(meta.reset_token_expires_at) > new Date()) {
          matchedUser = u
          break
        }
      }
    }

    if (!matchedUser) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    const newPasswordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS)
    const cleanedMeta: Record<string, any> = { ...((matchedUser.metadata as Record<string, any>) || {}) }
    delete cleanedMeta.reset_token_hash
    delete cleanedMeta.reset_token_expires_at
    delete cleanedMeta.reset_token
    delete cleanedMeta.reset_token_plain

    await supabaseAdmin
      .from('users')
      .update({
        password_hash: newPasswordHash,
        metadata: cleanedMeta,
      })
      .eq('id', matchedUser.id)

    await supabaseAdmin
      .from('user_sessions')
      .update({ active: false })
      .eq('user_id', matchedUser.id)
      .eq('active', true)

    await logActivity({
      userId: matchedUser.id,
      action: 'password_reset',
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Password reset failed')
  }
}

/**
 * Change Password: Verify current password and update
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Fetch user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw notFound('User')
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password_hash)

    if (!passwordValid) {
      throw unauthorized('Current password is incorrect')
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS)

    await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)

    // Revoke all sessions
    await supabaseAdmin
      .from('user_sessions')
      .update({ active: false })
      .eq('user_id', userId)
      .eq('active', true)

    // Log activity
    await logActivity({
      userId,
      action: 'password_changed',
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Password change failed')
  }
}

/**
 * Get Sessions: Retrieve user's active sessions
 */
export async function getSessions(userId: string) {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw internalError('Failed to retrieve sessions')
    }

    return sessions || []
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Failed to retrieve sessions')
  }
}

/**
 * Revoke Sessions: Revoke one or all sessions
 */
export async function revokeSessions(userId: string, sessionId?: string): Promise<void> {
  try {
    let query = supabaseAdmin
      .from('user_sessions')
      .update({ active: false })
      .eq('user_id', userId)
      .eq('active', true)

    if (sessionId) {
      query = query.eq('id', sessionId)
    }

    const { error } = await query

    if (error) {
      throw internalError('Failed to revoke sessions')
    }

    await logActivity({
      userId,
      action: 'sessions_revoked',
      metadata: sessionId ? { sessionId } : { allSessions: true },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Failed to revoke sessions')
  }
}

/**
 * Get current user with roles
 */
export async function getCurrentUser(userId: string) {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(
        `
        id,
        email,
        email_verified,
        status,
        last_login_at,
        created_at,
        updated_at,
        role,
        user_profiles!inner (display_name, avatar_url, bio)
      `
      )
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw notFound('User')
    }

    return {
      ...user,
      fullName: user.user_profiles?.display_name,
      avatarUrl: user.user_profiles?.avatar_url,
      roles: [user.role]
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Failed to fetch user')
  }
}

// Aliases for backward compatibility
export const forgotPassword = createPasswordReset
