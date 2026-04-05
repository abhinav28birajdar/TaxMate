import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

export const onboardingSchema = z.object({
  step: z.number().int().min(1).max(3),
  basicInfo: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
  interests: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  socialLinks: z.record(z.string().url()).optional(),
  isPublic: z.boolean().optional(),
});

export const notificationCreateSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  metadata: z.record(z.unknown()).optional(),
});

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  preferences: z.record(z.unknown()).optional(),
  notificationSettings: z.record(z.boolean()).optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const featureFlagSchema = z.object({
  key: z.string().min(2).max(100),
  description: z.string().min(3).max(255),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).default(100),
});
