import { NextResponse } from 'next/server';
import { HttpError } from './errors';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

export function ok<T>(data: T, message = 'OK', status = 200) {
  const payload: ApiEnvelope<T> = {
    success: true,
    message,
    data,
  };

  return NextResponse.json(payload, { status });
}

export function fail(error: unknown) {
  if (error instanceof HttpError) {
    const payload: ApiEnvelope = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
      },
    };
    return NextResponse.json(payload, { status: error.statusCode });
  }

  console.error('Unhandled API error', error);
  const payload: ApiEnvelope = {
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
  return NextResponse.json(payload, { status: 500 });
}
