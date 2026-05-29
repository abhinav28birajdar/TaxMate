/**
 * UNIFIED VALIDATION SCHEMAS
 * Single source of truth for all form validations
 * 
 * Created: 2026-04-08
 */

import { z } from 'zod';

// ============================================================================
// AUTH VALIDATION
// ============================================================================

/**
 * Login form validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password too short'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Sign up form validation
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  role: z.enum(['CA', 'CLIENT', 'STAFF']),
  agreeToTerms: z
    .boolean()
    .refine((v) => v === true, 'You must agree to terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Forgot password validation
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password validation
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * OTP verification validation
 */
export const verifyOTPSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must contain only digits'),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

/**
 * Change password validation
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================================================
// PROFILE VALIDATION
// ============================================================================

/**
 * User profile update validation
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z
    .string()
    .email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio too long')
    .optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * CA Profile validation
 */
export const caProfileSchema = z.object({
  icaiMembershipNumber: z
    .string()
    .min(5, 'Invalid ICAI membership number')
    .optional(),
  firmName: z
    .string()
    .max(200, 'Firm name too long')
    .optional(),
  designation: z.string().optional(),
  yearsOfExperience: z
    .number()
    .min(0)
    .max(80)
    .optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  officeAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode').optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN').optional(),
  consultationFee: z.number().positive().optional(),
  acceptsOnlinePayment: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
});

export type CAProfileInput = z.infer<typeof caProfileSchema>;

/**
 * Client Profile validation
 */
export const clientProfileSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN').optional(),
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar number').optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').optional(),
  industry: z.string().optional(),
  annualTurnover: z.number().positive().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode').optional(),
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;

// ============================================================================
// DOCUMENT VALIDATION
// ============================================================================

/**
 * Document upload validation
 */
export const documentUploadSchema = z.object({
  fileName: z
    .string()
    .min(3, 'File name must be at least 3 characters'),
  documentType: z.string().optional(),
  fileSize: z
    .number()
    .max(10485760, 'File size must be less than 10MB'),
  mimeType: z.string(),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

//============================================================================
// TASK VALIDATION
// ============================================================================

/**
 * Create/Update task validation
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long'),
  description: z
    .string()
    .max(2000, 'Description too long')
    .optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;

// ============================================================================
// INVOICE VALIDATION
// ============================================================================

/**
 * Create/Update invoice validation
 */
export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .min(3, 'Invoice number required'),
  description: z
    .string()
    .optional(),
  amount: z
    .number()
    .positive('Amount must be positive'),
  dueDate: z
    .string()
    .datetime()
    .optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// ============================================================================
// APPOINTMENT VALIDATION
// ============================================================================

/**
 * Create appointment validation
 */
export const appointmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters'),
  description: z
    .string()
    .optional(),
  type: z.enum(['VIDEO_CALL', 'IN_PERSON', 'PHONE_CALL']),
  startTime: z.string().datetime('Invalid date/time'),
  endTime: z.string().datetime('Invalid date/time'),
  meetingLink: z.string().url().optional(),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

/**
 * Send message validation
 */
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long'),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'SYSTEM']).optional().default('TEXT'),
});

export type MessageInput = z.infer<typeof messageSchema>;
