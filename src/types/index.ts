// Core user types
export interface User {
  id: string;
  email: string;
  passwordHash?: never;
  isEmailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  deviceInfo?: unknown;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: unknown;
  createdAt: string;
}

// Onboarding types
export interface OnboardingData {
  id: string;
  userId: string;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  completedAt?: string;
  stepsData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// File upload types
export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  storagePath: string;
  bucket: string;
  isPublic: boolean;
  metadata?: unknown;
  createdAt: string;
  deletedAt?: string;
}

// Support ticket types
export interface SupportTicket {
  id: string;
  userId?: string;
  ticketNumber: string;
  subject: string;
  body: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId?: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

// Activity tracking
export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: unknown;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tableName: string;
  recordId?: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldData?: unknown;
  newData?: unknown;
  changedBy?: string;
  changedAt: string;
  ipAddress?: string;
}

// Feature flags
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

// Request/Response DTOs
export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  sessionId: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationDefaults(page?: number, limit?: number) {
  const p = Math.max(1, page || 1);
  const l = Math.min(100, Math.max(1, limit || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}
