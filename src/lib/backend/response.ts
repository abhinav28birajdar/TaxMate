import { NextResponse } from 'next/server';
import { AppError, isAppError } from './errors';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiEnvelope<T>> {
  const envelope: ApiEnvelope<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(envelope, { status });
}

export function errorResponse(
  error: AppError | Error | unknown,
  defaultMessage: string = 'An error occurred'
): NextResponse<ApiEnvelope> {
  if (isAppError(error)) {
    const envelope: ApiEnvelope = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
      },
    };
    return NextResponse.json(envelope, { status: error.statusCode });
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error.message, error.stack);
    const envelope: ApiEnvelope = {
      success: false,
      message: defaultMessage,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
    return NextResponse.json(envelope, { status: 500 });
  }

  console.error('Unknown error:', error);
  const envelope: ApiEnvelope = {
    success: false,
    message: defaultMessage,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
  return NextResponse.json(envelope, { status: 500 });
}

export const ok = successResponse;
export const fail = errorResponse;
