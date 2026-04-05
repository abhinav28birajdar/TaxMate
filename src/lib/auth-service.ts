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
  return jwt.SignJWT(payload)
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
  const supabase = createClient();
  const sessionToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      token: sessionToken,
      ip_address: ipAddress,
      user_agent: process.env.USER_AGENT || 'unknown',
      expires_at: expiresAt.toISOString(),
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
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_sessions')
    .select('user_id, expires_at')
    .eq('token', sessionToken)
    .single();

  if (error || !data) {
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
  const supabase = createClient();

  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('token', sessionToken);

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
  const supabase = createClient();

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: ipAddress,
    });

  if (error) {
    console.error('Failed to create audit log:', error);
  }
}
