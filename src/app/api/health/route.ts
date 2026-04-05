import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/backend/response';
import { getServiceClient } from '@/lib/backend/supabase';

export async function GET(request: NextRequest) {
  try {
    const client = getServiceClient();

    // Check database connectivity
    const { error } = await client.from('users').select('count').limit(1);

    if (error) {
      return successResponse(
        {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
        },
        'System healthy but database check failed',
        200
      );
    }

    return successResponse(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      },
      'System is operational',
      200
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : new Error('Health check failed'),
      'Health check failed'
    );
  }
}
