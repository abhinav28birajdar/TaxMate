import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export interface JournalEntryRecord {
  id: string;
  voucherNumber: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: 'draft' | 'posted';
  createdAt: string;
}

async function readUserJournalSettings(userId: string): Promise<{
  entries: JournalEntryRecord[];
  metadata: Record<string, any>;
}> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('settings')
    .select('metadata')
    .eq('user_id', userId)
    .maybeSingle();

  const metadata = (data?.metadata && typeof data.metadata === 'object' ? data.metadata : {}) as Record<string, any>;
  const entries = Array.isArray(metadata.journal_entries) ? (metadata.journal_entries as JournalEntryRecord[]) : [];
  return { entries, metadata };
}

async function saveUserJournalSettings(
  userId: string,
  entries: JournalEntryRecord[],
  metadata: Record<string, any>
) {
  const supabase = getServiceClient();
  const nextMeta = {
    ...metadata,
    journal_entries: entries,
  };
  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        user_id: userId,
        metadata: nextMeta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff && !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { entries } = await readUserJournalSettings(auth.userId);
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    console.error('Journal GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to load journal entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff && !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const description = String(body.description || '').trim();
    const debitAccount = String(body.debitAccount || 'Accounts Receivable').trim();
    const creditAccount = String(body.creditAccount || 'Consultancy Revenue').trim();
    const amount = Number(body.amount);
    const date = String(body.date || new Date().toISOString().slice(0, 10));
    const status = body.status === 'posted' ? 'posted' : 'draft';

    if (!description || description.length < 3) {
      return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const { entries, metadata } = await readUserJournalSettings(auth.userId);
    const year = new Date().getFullYear();
    const nextSeq = String(entries.length + 1).padStart(3, '0');
    const newEntry: JournalEntryRecord = {
      id: `jv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      voucherNumber: `JV-${year}-${nextSeq}`,
      date,
      description,
      debitAccount,
      creditAccount,
      amount,
      status,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    await saveUserJournalSettings(auth.userId, updated, metadata);

    return NextResponse.json({ success: true, entry: newEntry, entries: updated }, { status: 201 });
  } catch (error: any) {
    console.error('Journal POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save journal entry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff && !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body.id || '').trim();
    const status = body.status === 'posted' ? 'posted' : 'draft';
    if (!id) {
      return NextResponse.json({ success: false, error: 'Entry id is required' }, { status: 400 });
    }

    const { entries, metadata } = await readUserJournalSettings(auth.userId);
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    const updated = [...entries];
    updated[idx] = { ...updated[idx], status };
    await saveUserJournalSettings(auth.userId, updated, metadata);

    return NextResponse.json({ success: true, entry: updated[idx], entries: updated });
  } catch (error: any) {
    console.error('Journal PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update journal entry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff && !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Entry id is required' }, { status: 400 });
    }

    const { entries, metadata } = await readUserJournalSettings(auth.userId);
    const updated = entries.filter((e) => e.id !== id);
    await saveUserJournalSettings(auth.userId, updated, metadata);

    return NextResponse.json({ success: true, entries: updated });
  } catch (error: any) {
    console.error('Journal DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete journal entry' }, { status: 500 });
  }
}

