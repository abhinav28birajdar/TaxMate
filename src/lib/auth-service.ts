import { createClient } from '@/utils/supabase/server';
import { hash, compare } from 'bcryptjs';
import * as jwt from 'jose';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';
import * as otpauth from 'otpauth';
import QRCode from 'qrcode';

// Safe lazy Resend client getter to prevent build errors when RESEND_API_KEY is not set
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || 're_mock_key_for_build';
  return new Resend(apiKey);
}

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
    if (!process.env.RESEND_API_KEY) {
      console.log(`[Simulated Email] Verification link for ${email}: ${verificationLink}`);
      return true;
    }

    const resend = getResendClient();
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Verify your email - Taxmate',
      html: `
        <h2>Welcome to Taxmate, ${name}!</h2>
        <p>Please verify your email to activate your account.</p>
        <p>
          <a href="${verificationLink}" style="background-color: #65a30d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
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
    if (!process.env.RESEND_API_KEY) {
      console.log(`[Simulated Email] Password reset link for ${email}: ${resetLink}`);
      return true;
    }

    const resend = getResendClient();
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Reset your password - Taxmate',
      html: `
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        <p>
          <a href="${resetLink}" style="background-color: #65a30d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
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
    if (!process.env.RESEND_API_KEY) {
      console.log(`[Simulated OTP Email] OTP for ${email}: ${otp}`);
      return true;
    }

    const resend = getResendClient();
    const response = await resend.emails.send({
      from: 'Taxmate <noreply@taxmate.in>',
      to: email,
      subject: 'Your verification code - Taxmate',
      html: `
        <h2>Verification Code</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <h3 style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #65a30d;">${otp}</h3>
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
    const totp = new otpauth.TOTP({
      issuer: 'Taxmate',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;
    const uri = totp.toString();

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

  if (!data.active) {
    return null;
  }

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
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = await createClient();

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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

      const emailSent = await sendOTPEmail(email, userData.name, otp);
      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }

      await createAuditLog(userData.id, 'OTP_SENT', 'AUTH');

      return { success: true, message: 'OTP sent to email' };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  async verifyOTP(email: string, otp: string): Promise<{ user: any; token: string }> {
    try {
      const supabase = await createClient();

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

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

      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('OTP has expired');
      }

      if (tokenData.used) {
        throw new Error('OTP has already been used');
      }

      const { error: updateError } = await supabase
        .from('verification_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      if (updateError) {
        throw new Error('Failed to verify OTP');
      }

      const token = await generateJWT({ userId: userData.id, email: userData.email });

      const sessionToken = await createUserSession(userData.id);
      if (!sessionToken) {
        throw new Error('Failed to create session');
      }

      await createAuditLog(userData.id, 'OTP_VERIFIED', 'AUTH');

      const { password_hash, two_factor_secret, ...safeUser } = userData;

      return { user: safeUser, token };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },
};
