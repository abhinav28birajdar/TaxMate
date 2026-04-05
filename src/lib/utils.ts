import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ID generation
export function generateId(): string {
  return randomUUID();
}

// Token hashing
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// User sanitization
export function sanitizeUser(user: any): any {
  if (!user) return null;
  const { password_hash, passwordHash, ...rest } = user;
  return rest;
}

// Pagination helper
export function paginate(page: number = 1, limit: number = 20): { offset: number; limit: number } {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return {
    offset: (p - 1) * l,
    limit: l,
  };
}

// IP address extraction
export function getIpAddress(request: NextRequest | Request): string {
  if (request instanceof NextRequest) {
    return request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  }
  const headers = request.headers;
  return (headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown').trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL slugify
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Date formatting
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

// Parse pagination from URL
export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  return { page, limit };
}

// Build response pagination metadata
export function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}
