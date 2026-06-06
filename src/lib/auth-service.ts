import { createClient } from '@/utils/supabase/server';
import { hash, compare } from 'bcryptjs';
import * as jwt from 'jose';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';
import * as otpauth from 'otpauth';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

/**
 * Generate JWT token
 */
export async function generateJWT(
  payload: Record<string, any>,
  expiresIn: string = '7d'
): Promise<string> {
  return new jwt.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyJWT(token: string): Promise<Record<string, any> | null> {
  try {
    const verified = await jwt.jwtVerify(token, JWT_SECRET);
    return verified.payload as Record<string, any>;
  } catch {
    return null;
  }
}

/**
 * Generate OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Verify your email - Taxmate',
      html: `
        <h2>Welcome to Taxmate, ${name}!</h2>
        <p>Please verify your email to activate your account.</p>
        <p>
          <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
      `,
    });

    return response.error === null;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Reset your password - Taxmate',
      html: `
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        <p>
          <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
      `,
    });

    return response.error === null;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Your verification code - Taxmate',
      html: `
        <h2>Verification Code</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <h3 style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${otp}</h3>
        <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
      `,
    });

    return response.error === null;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

/**
 * Setup 2FA - Generate secret and QR code
 */
export async function setup2FA(email: string): Promise<{ secret: string; qrCode: string } | null> {
  try {
    // Generate TOTP secret
    const totp = new otpauth.TOTP({
      issuer: 'Taxmate',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;
    const uri = totp.toString();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(uri);

    return { secret, qrCode };
  } catch (error) {
    console.error('Failed to setup 2FA:', error);
    return null;
  }
}

/**
 * Verify 2FA token
 */
export function verify2FAToken(secret: string, token: string): boolean {
  try {
    const totp = new otpauth.TOTP({
      issuer: 'Taxmate',
      label: 'Taxmate User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: otpauth.Secret.fromBase32(secret),
    });

    // Allow for time skew (±30 seconds = 1 window)
    return totp.validate({ token, window: 1 }) !== null;
  } catch (error) {
    console.error('Failed to verify 2FA token:', error);
    return false;
  }
}

/**
 * Create or update user session
 */
export async function createUserSession(userId: string, ipAddress?: string) {
  const supabase = await createClient();
  const sessionToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      token_hash: sessionToken,
      ip_address: ipAddress,
      user_agent: process.env.USER_AGENT || 'unknown',
      expires_at: expiresAt.toISOString(),
      active: true,
    });

  if (error) {
    console.error('Failed to create session:', error);
    return null;
  }

  return sessionToken;
}

/**
 * Validate user session
 */
export async function validateUserSession(sessionToken: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_sessions')
    .select('user_id, expires_at, active')
    .eq('token_hash', sessionToken)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if session is revoked
  if (!data.active) {
    return null;
  }

  // Check if session is expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data.user_id;
}

/**
 * Invalidate user session
 */
export async function invalidateUserSession(sessionToken: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_sessions')
    .update({ active: false })
    .eq('token_hash', sessionToken);

  if (error) {
    console.error('Failed to invalidate session:', error);
    return false;
  }

  return true;
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return nanoid(64);
}

/**
 * Create audit log
 */
export async function createAuditLog(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  ipAddress?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: resourceType,
      entity_id: resourceId,
      ip_address: ipAddress,
    });

  if (error) {
    console.error('Failed to create activity log:', error);
  }
}

/**
 * Auth Service Object - OTP Management
 */
export const authService = {
  /**
   * Send OTP to user email
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = await createClient();

      // Get user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in verification_tokens table
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({
          user_id: userData.id,
          token: otp,
          type: 'OTP',
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        throw new Error('Failed to generate OTP');
      }

      // Send OTP email
      const emailSent = await sendOTPEmail(email, userData.name, otp);
      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }

      // Log action
      await createAuditLog(userData.id, 'OTP_SENT', 'AUTH');

      return { success: true, message: 'OTP sent to email' };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  /**
   * Verify OTP and return auth token
   */
  async verifyOTP(email: string, otp: string): Promise<{ user: any; token: string }> {
    try {
      const supabase = await createClient();

      // Get user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Verify OTP
      const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('user_id', userData.id)
        .eq('token', otp)
        .eq('type', 'OTP')
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid OTP');
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('OTP has expired');
      }

      // Check if token is already used
      if (tokenData.used) {
        throw new Error('OTP has already been used');
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('verification_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      if (updateError) {
        throw new Error('Failed to verify OTP');
      }

      // Generate JWT token
      const token = await generateJWT({ userId: userData.id, email: userData.email });

      // Create session
      const sessionToken = await createUserSession(userData.id);
      if (!sessionToken) {
        throw new Error('Failed to create session');
      }

      // Log action
      await createAuditLog(userData.id, 'OTP_VERIFIED', 'AUTH');

      // Return user without sensitive data
      const { password_hash, two_factor_secret, ...safeUser } = userData;

      return { user: safeUser, token };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },
};
