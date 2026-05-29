/**
 * POST /api/esignature/request
 * Create an e-signature request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@lib/supabase/server';
import ESignatureService from '@/lib/services/esignature-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, signerId, title, message } = body;

    if (!documentId || !signerId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const esignatureService = ESignatureService;
    const request = await esignatureService.createSignatureRequest(
      documentId,
      user.id,
      signerId,
      title,
      message
    );

    return NextResponse.json({ data: request }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating signature request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create signature request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/esignature/requests
 * Get pending signature requests
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type') || 'pending';

    const esignatureService = ESignatureService;

    if (type === 'pending') {
      const requests = await esignatureService.getPendingSignatures(user.id);
      return NextResponse.json({ data: requests });
    } else {
      const { sent, received } = await esignatureService.getUserSignatureRequests(user.id);
      return NextResponse.json({ data: { sent, received } });
    }
  } catch (error: any) {
    console.error('Error fetching signature requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch signature requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/esignature/sign
 * Sign a document
 */
async function signDocument(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { signatureRequestId, signatureUrl } = body;

    if (!signatureRequestId || !signatureUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const esignatureService = ESignatureService;
    const signed = await esignatureService.signDocument(
      signatureRequestId,
      signatureUrl,
      user.id
    );

    return NextResponse.json({ data: signed });
  } catch (error: any) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign document' },
      { status: 500 }
    );
  }
}
