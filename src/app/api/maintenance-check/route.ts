import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const message = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || 'We are performing scheduled maintenance. We will be back shortly.';

    return NextResponse.json({
      isMaintenance,
      message,
      estimatedEnd: null,
      appVersion: '1.0.0',
    });
  } catch (error: any) {
    return NextResponse.json({ isMaintenance: false, error: error.message }, { status: 500 });
  }
}
