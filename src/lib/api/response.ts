/**
 * Unified API Response Handler
 * Provides consistent response format across all API endpoints
 */

interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

interface ApiErrorOptions {
  code?: string;
  statusCode?: number;
  cause?: Error;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code || 'INTERNAL_ERROR';
    this.statusCode = options.statusCode || 500;
    this.details = options.details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function successResponse<T>(
  data: T,
  message = 'Request successful',
  statusCode = 200
): ApiResponse<T> {
  return {
    success: true,
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  message: string,
  error: ApiError | Error,
  statusCode?: number
): ApiResponse {
  const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR';
  const status = error instanceof ApiError ? error.statusCode : statusCode || 500;

  return {
    success: false,
    status,
    message,
    error: {
      code,
      details: error instanceof ApiError ? error.details : undefined,
    },
    timestamp: new Date().toISOString(),
  };
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;
