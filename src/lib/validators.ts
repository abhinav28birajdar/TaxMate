import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const passwordSchema = z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

export const registerCASchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
    icaiMembershipNumber: z.string().min(5, 'ICAI membership number required'),
    firmName: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    agreeToTerms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const registerClientSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
    panNumber: z.string().regex(panRegex, 'Invalid PAN format (e.g., ABCDE1234F)'),
    businessType: z.enum(['individual', 'sole_proprietor', 'pvt_ltd', 'llp', 'partnership', 'huf', 'trust']),
    caCode: z.string().optional(),
    agreeToTerms: z.boolean().refine(v => v === true),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const createInvoiceSchema = z.object({
    clientId: z.string().uuid('Invalid client'),
    invoiceDate: z.coerce.date(),
    dueDate: z.coerce.date().optional(),
    title: z.string().optional(),
    notes: z.string().max(2000).optional(),
    termsConditions: z.string().max(2000).optional(),
    lineItems: z.array(z.object({
        description: z.string().min(1, 'Description required').max(1000),
        hsnSacCode: z.string().max(20).optional(),
        quantity: z.number().positive().max(99999),
        unit: z.string().max(50).default('service'),
        rate: z.number().positive().max(9999999),
        taxRate: z.number().min(0).max(100).default(18),
    })).min(1, 'At least one line item is required'),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().min(0).optional(),
    templateId: z.string().optional(),
    templateColor: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    recurringEndDate: z.coerce.date().optional(),
});

export const createTaskSchema = z.object({
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    clientId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.coerce.date().optional(),
    estimatedHours: z.number().positive().max(9999).optional(),
    tags: z.array(z.string()).default([]),
    isBillable: z.boolean().default(false),
    billingRate: z.number().positive().optional(),
    subtasks: z.array(z.object({
        title: z.string().min(1),
        completed: z.boolean().default(false),
    })).optional(),
});

export const createAppointmentSchema = z.object({
    clientId: z.string().uuid(),
    scheduledAt: z.coerce.date().min(new Date(), 'Cannot book past appointments'),
    durationMinutes: z.number().min(15).max(480).default(60),
    type: z.enum(['VIDEO_CALL', 'IN_PERSON', 'PHONE_CALL']).default('VIDEO_CALL'),
    title: z.string().optional(),
    description: z.string().optional(),
    agenda: z.string().optional(),
});

export const createTaxFilingSchema = z.object({
    clientId: z.string().uuid(),
    type: z.enum(['ITR_1', 'ITR_2', 'ITR_3', 'ITR_4', 'GSTR_1', 'GSTR_3B', 'GSTR_9', 'TDS_24Q', 'TDS_26Q', 'ADVANCE_TAX', 'OTHER']),
    financialYear: z.string().regex(/^\d{4}-\d{2}$/, 'Format: 2024-25'),
    assessmentYear: z.string().optional(),
    period: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    feeCharged: z.number().positive().optional(),
    notes: z.string().optional(),
});

export const createExpenseSchema = z.object({
    title: z.string().min(1).max(500),
    amount: z.number().positive(),
    category: z.enum(['OFFICE_SUPPLIES', 'TRAVEL', 'MEALS', 'SOFTWARE', 'HARDWARE', 'MARKETING', 'LEGAL', 'UTILITIES', 'RENT', 'SALARIES', 'PROFESSIONAL_FEES', 'TAXES', 'INSURANCE', 'OTHER']),
    expenseDate: z.coerce.date(),
    clientId: z.string().uuid().optional(),
    isTaxDeductible: z.boolean().default(false),
    gstAmount: z.number().min(0).optional(),
    vendorName: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
});

export const createReviewSchema = z.object({
    rating: z.number().min(1).max(5),
    title: z.string().max(255).optional(),
    content: z.string().max(2000).optional(),
    communicationRating: z.number().min(1).max(5).optional(),
    expertiseRating: z.number().min(1).max(5).optional(),
    timelinessRating: z.number().min(1).max(5).optional(),
});
