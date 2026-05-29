import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'
import { env } from './env'
import { AppError, conflict, unauthorized, notFound, internalError } from './errors'
import { signAccessToken } from './jwt'
import { logActivity } from './audit'

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

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
        is_verified: false,
        is_locked: false,
        failed_login_attempts: 0,
      })
      .select()
      .single()

    if (userError || !user) {
      throw internalError('Failed to create user')
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      user_id: user.id,
      full_name: input.fullName || null,
      is_public: false,
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Assign 'user' role
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'user')
      .single()

    if (roleData) {
      await supabaseAdmin.from('user_roles').insert({
        user_id: user.id,
        role_id: roleData.id,
      })
    }

    // Create onboarding data
    const { error: onboardError } = await supabaseAdmin.from('onboarding_data').insert({
      user_id: user.id,
      current_step: 1,
      completed_steps: [],
      is_complete: false,
      data: {},
    })

    if (onboardError) {
      console.error('Onboarding data creation error:', onboardError)
    }

    // Create user settings
    const { error: settingsError } = await supabaseAdmin.from('user_settings').insert({
      user_id: user.id,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      push_notifications: false,
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

    // Check if account is locked
    if (user.is_locked) {
      throw new AppError('Account is locked', 423, 'ACCOUNT_LOCKED')
    }

    // Verify password
    const passwordValid = await bcrypt.compare(input.password, user.password_hash)

    if (!passwordValid) {
      // Increment failed attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1
      const shouldLock = newAttempts >= 5

      await supabaseAdmin
        .from('users')
        .update({
          failed_login_attempts: newAttempts,
          is_locked: shouldLock,
          locked_at: shouldLock ? new Date().toISOString() : null,
        })
        .eq('id', user.id)

      if (shouldLock) {
        throw new AppError('Account is locked due to too many failed login attempts', 423, 'ACCOUNT_LOCKED')
      }

      throw unauthorized('Invalid credentials')
    }

    // Get user roles
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('roles (name)')
      .eq('user_id', user.id)

    const roles = userRoles?.map((ur: any) => ur.roles.name) || ['user']

    // Create session
    const tokenHash = await bcrypt.hash(Math.random().toString(), 10)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        device_info: input.deviceInfo || null,
        ip_address: input.ipAddress,
        user_agent: input.userAgent || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (sessionError || !session) {
      throw internalError('Failed to create session')
    }

    // Sign JWT
    const token = await signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
      sessionId: session.id,
    })

    // Reset failed attempts and update last login
    await supabaseAdmin
      .from('users')
      .update({
        failed_login_attempts: 0,
        is_locked: false,
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
        .from('sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
    } else {
      // Revoke all sessions
      await supabaseAdmin
        .from('sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('revoked_at', null)
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
 * Create Password Reset: Generate reset token
 */
export async function createPasswordReset(email: string): Promise<string> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (!user) {
      // Don't reveal if email exists - silent success for security
      return 'password-reset-sent'
    }

    // Generate a secure reset token
    const resetToken = crypto.randomUUID()
    const tokenHash = await bcrypt.hash(resetToken, 10)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in a password_reset_tokens table or user metadata
    // For now, storing in user metadata as JSON (not ideal for production)
    // In production, create a separate password_reset_tokens table
    await supabaseAdmin
      .from('users')
      .update({
        metadata: {
          reset_token: tokenHash,
          reset_token_expires_at: expiresAt.toISOString(),
          reset_token_plain: resetToken, // TEMPORARY - for demo only
        },
      })
      .eq('id', user.id)

    // In production, send via Resend or similar
    console.log(`Reset token for ${email}: ${resetToken}`)

    return resetToken
  } catch (error) {
    console.error('Forgot password error:', error)
    throw internalError('Failed to process password reset request')
  }
}

/**
 * Reset Password: Verify token and update password
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    // Find user by checking for matching reset token
    // This is a simplified approach - in production, use a dedicated reset_tokens table
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, metadata')
      .not('metadata', 'is', null)

    let user = null
    for (const u of users || []) {
      const meta = u.metadata as any
      if (meta?.reset_token_plain === token) {
        // Verify token hasn't expired
        if (new Date(meta.reset_token_expires_at) > new Date()) {
          user = u
          break
        }
      }
    }

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS)

    // Update password
    await supabaseAdmin
      .from('users')
      .update({
        password_hash: newPasswordHash,
        metadata: null, // Clear reset token
      })
      .eq('id', user.id)

    // Revoke all sessions
    await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('revoked_at', null)

    // Log activity
    await logActivity({
      userId: user.id,
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
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null)

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
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
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
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null)

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
        is_verified,
        is_locked,
        last_login_at,
        created_at,
        updated_at,
        profiles!inner (full_name, avatar_url, bio, website),
        user_roles!inner (roles (name))
      `
      )
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw notFound('User')
    }

    return user
  } catch (error) {
    if (error instanceof AppError) throw error
    throw internalError('Failed to fetch user')
  }
}

// Aliases for backward compatibility
export const forgotPassword = createPasswordReset
