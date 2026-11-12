/**
 * Input Validation Utilities
 * Validates and sanitizes user input across the API
 */

import { z } from 'zod';

// Common validation schemas
export const ValidatedSchemas = {
  email: z.string().email('Invalid email format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  
  uuid: z.string().uuid('Invalid UUID format'),
  
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone format'),
  
  url: z.string().url('Invalid URL format'),
  
  caseTitle: z
    .string()
    .min(5, 'Case title must be at least 5 characters')
    .max(200, 'Case title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),

  amount: z
    .number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number')
    .max(999999999, 'Amount exceeds maximum value'),
};

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength = 5000): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .substring(0, maxLength); // Limit length
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  maxDepth = 5,
  depth = 0
): T {
  if (depth > maxDepth) {
    throw new Error('Object nesting exceeds maximum depth');
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      sanitized[key] = sanitizeObject(value, maxDepth, depth + 1);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null && !(item instanceof Date)
          ? sanitizeObject(item, maxDepth, depth + 1)
          : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
}

/**
 * Common request validation schemas
 */
export const RequestSchemas = {
  // User/Auth
  registerUser: z.object({
    email: ValidatedSchemas.email,
    password: ValidatedSchemas.password,
    name: ValidatedSchemas.name,
    phone: ValidatedSchemas.phone.optional(),
    role: z.enum(['CA', 'CLIENT']),
  }),

  loginUser: z.object({
    email: ValidatedSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    name: ValidatedSchemas.name.optional(),
    phone: ValidatedSchemas.phone.optional(),
    avatarUrl: ValidatedSchemas.url.optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: ValidatedSchemas.password,
  }),

  // Cases
  createCase: z.object({
    title: z.string().trim().min(3, 'Case title must be at least 3 characters').max(200),
    description: z.string().max(5000).optional().default(''),
    clientId: ValidatedSchemas.uuid.optional().nullable(),
    clientName: z.string().trim().max(200).optional(),
    caseType: z.string().trim().max(100).optional(),
    tags: z.array(z.string().trim().max(40)).optional(),
    assignedCaId: ValidatedSchemas.uuid.optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    deadline: z.string().optional().nullable(),
  }),

  updateCase: z.object({
    title: ValidatedSchemas.caseTitle.optional(),
    description: ValidatedSchemas.description.optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'FILED', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  }),

  // Invoices/Payments
  createInvoice: z.object({
    clientId: ValidatedSchemas.uuid,
    caseId: ValidatedSchemas.uuid.optional(),
    amount: ValidatedSchemas.amount,
    description: ValidatedSchemas.description,
    dueDate: z.string().datetime(),
  }),

  // Appointments
  createAppointment: z.object({
    clientId: ValidatedSchemas.uuid.optional(),
    caId: ValidatedSchemas.uuid.optional(),
    title: z.string().min(3).max(200),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    type: z.enum(['VIDEO', 'VIDEO_CALL', 'PHONE', 'PHONE_CALL', 'IN_PERSON']),
    notes: z.string().max(1000).optional(),
    category: z.string().max(80).optional(),
    fee: z.union([z.number(), z.string()]).optional(),
  }),

  // Messages
  sendMessage: z.object({
    conversationId: ValidatedSchemas.uuid,
    content: z.string().min(1).max(5000),
    fileUrl: ValidatedSchemas.url.optional(),
    replyToId: ValidatedSchemas.uuid.optional(),
    messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'SYSTEM']).optional(),
    attachments: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1).max(255),
          size: z.number().nonnegative().optional(),
          mimeType: z.string().max(128).optional(),
          url: z.string().max(2048).optional(),
          path: z.string().max(1024).optional(),
        })
      )
      .max(10)
      .optional(),
  }),
};
