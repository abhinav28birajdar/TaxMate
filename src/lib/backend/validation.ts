import { z } from 'zod';
import { validationError } from './errors';

// Password validation: min 8 chars, 1 uppercase, 1 number
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  twitter: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const onboardingUpdateSchema = z.object({
  currentStep: z.number().int().min(1, 'Step must be at least 1'),
  stepsData: z.record(z.unknown()).optional().default({}),
});

export const notificationCreateSchema = z.object({
  type: z.string().min(1, 'Notification type is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const notificationUpdateSchema = z.object({
  isRead: z.boolean(),
});

export const settingsUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  isPublic: z.boolean().optional().default(false),
});

export const ticketCreateSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
});

export const ticketUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  resolution: z.string().optional(),
});

export const ticketReplySchema = z.object({
  body: z.string().min(1, 'Reply body is required'),
  isInternal: z.boolean().optional().default(false),
});

export const featureFlagSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isEnabled: z.boolean(),
  rolloutPercentage: z.number().int().min(0).max(100).optional().default(0),
  targetUsers: z.array(z.string().uuid()).optional(),
});

export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});

export async function validateBody<T extends z.ZodSchema>(schema: T, request: Request): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw validationError(
        error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }))
      );
    }
    throw validationError({ error: 'Invalid request body' });
  }
}
