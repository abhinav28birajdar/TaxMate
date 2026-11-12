import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/client-service';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0', 10) || 0);
    const take = Math.min(100, Math.max(1, parseInt(searchParams.get('take') || '20', 10) || 20));

    const requestedCaId = searchParams.get('caId');
    const caId = auth.isAdmin && requestedCaId ? requestedCaId : auth.userId;

    const result = await clientService.getClientsByCA(caId, {
      search: search || undefined,
      type,
      status,
      skip,
      take,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const client = await clientService.createClient(auth.userId, body);

    return NextResponse.json(
      { success: true, client },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 400 }
    );
  }
}
