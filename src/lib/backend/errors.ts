export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(message, 400, 'BAD_REQUEST', details);
}

export function unauthorized(message: string = 'Unauthorized'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message: string = 'Forbidden'): AppError {
  return new AppError(message, 403, 'FORBIDDEN');
}

export function notFound(resource: string = 'Resource'): AppError {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, 'CONFLICT');
}

export function tooManyRequests(message: string = 'Too many requests'): AppError {
  return new AppError(message, 429, 'TOO_MANY_REQUESTS');
}

export function internalError(message: string = 'Internal server error'): AppError {
  return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
}

export function validationError(errors: unknown): AppError {
  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export class HttpError extends AppError {
  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message, statusCode, code, details);
    this.name = 'HttpError';
  }
}
