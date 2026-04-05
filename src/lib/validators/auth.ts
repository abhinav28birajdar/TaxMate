import { z } from 'zod';

// Registration validation
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number'),
  role: z.enum(['CA', 'CLIENT', 'STAFF']),
  icaiNumber: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: 'You must agree to terms and conditions',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// OTP verification
export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must contain only digits'),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

// Request password reset
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Invalid token'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Email verification
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Invalid token'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Setup 2FA
export const setup2FASchema = z.object({
  enabled: z.boolean(),
});

export type Setup2FAInput = z.infer<typeof setup2FASchema>;

// Verify 2FA
export const verify2FASchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 characters')
    .regex(/^[0-9]{6}$/, 'Token must contain only digits'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;

// Update profile
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  phone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
