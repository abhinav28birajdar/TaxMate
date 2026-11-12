import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getResolvedClientIdsForUser, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const clientIds = await getResolvedClientIdsForUser(auth.userId);

    let convQuery = supabase
      .from('conversations')
      .select('*')
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (!auth.isAdmin) {
      const orParts = [
        `ca_id.eq.${auth.userId}`,
        `participant_ids.cs.{${auth.userId}}`,
      ];
      if (clientIds.length > 0) {
        orParts.push(`client_id.in.(${clientIds.join(',')})`);
      }
      convQuery = convQuery.or(orParts.join(','));
    }

    const { data: conversations, error } = await convQuery;
    if (error) throw error;

    // Fetch participant names & latest messages for UI display
    const participantIdSet = new Set<string>();
    const conversationIds: string[] = [];
    for (const conv of conversations || []) {
      conversationIds.push(conv.id);
      if (conv.ca_id) participantIdSet.add(conv.ca_id);
      if (conv.client_id) participantIdSet.add(conv.client_id);
      for (const pid of conv.participant_ids || []) {
        if (pid) participantIdSet.add(pid);
      }
    }

    const [{ data: userRows }, { data: recentMessages }, { data: unreadReceipts }] = await Promise.all([
      participantIdSet.size > 0
        ? supabase.from('users').select('id, name, email, role').in('id', Array.from(participantIdSet))
        : Promise.resolve({ data: [] as any[] }),
      conversationIds.length > 0
        ? supabase
            .from('messages')
            .select('id, conversation_id, sender_id, content, created_at')
            .in('conversation_id', conversationIds)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] as any[] }),
      supabase
        .from('message_read_receipts')
        .select('message_id')
        .eq('user_id', auth.userId),
    ]);

    const userMap = new Map((userRows || []).map((u: any) => [u.id, u]));
    const readSet = new Set((unreadReceipts || []).map((r: any) => r.message_id));

    const latestByConv = new Map<string, any>();
    const unreadByConv = new Map<string, number>();

    for (const msg of recentMessages || []) {
      if (!latestByConv.has(msg.conversation_id)) {
        latestByConv.set(msg.conversation_id, msg);
      }
      if (msg.sender_id !== auth.userId && !readSet.has(msg.id)) {
        unreadByConv.set(msg.conversation_id, (unreadByConv.get(msg.conversation_id) || 0) + 1);
      }
    }

    // Also load eligible contacts to start new chats cleanly
    let contacts: any[] = [];
    if (auth.isCAOrStaff) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, full_name, email, portal_user_id, client_type')
        .eq('assigned_ca_id', auth.userId)
        .limit(50);
      contacts = (clients || []).map((c: any) => ({
        id: c.portal_user_id || c.id,
        clientId: c.id,
        name: c.full_name,
        email: c.email,
        roleSubtitle: c.client_type ? `Client (${c.client_type})` : 'Client',
      }));
    } else {
      const { data: rels } = await supabase
        .from('ca_client_relationships')
        .select('ca_id')
        .eq('client_id', auth.userId)
        .in('status', ['accepted', 'active']);

      const caIds = (rels || []).map((r: any) => r.ca_id).filter(Boolean);
      if (caIds.length > 0) {
        const [{ data: caUsers }, { data: caProfs }] = await Promise.all([
          supabase.from('users').select('id, name, email').in('id', caIds),
          supabase.from('public_ca_profiles').select('user_id, firm_name, designation').in('user_id', caIds),
        ]);
        const profMap = new Map((caProfs || []).map((p: any) => [p.user_id, p]));
        contacts = (caUsers || []).map((u: any) => {
          const prof = profMap.get(u.id);
          return {
            id: u.id,
            caId: u.id,
            name: u.name || u.email,
            email: u.email,
            roleSubtitle: prof?.firm_name || prof?.designation || 'Chartered Accountant',
          };
        });
      }
    }

    const formatted = (conversations || []).map((conv: any) => {
      const peerId = (conv.participant_ids || []).find((p: string) => p !== auth.userId) ||
        (conv.ca_id === auth.userId ? conv.client_id : conv.ca_id);
      const peerUser = peerId ? userMap.get(peerId) : null;
      const latest = latestByConv.get(conv.id);

      return {
        ...conv,
        displayTitle: conv.title || conv.subject || peerUser?.name || peerUser?.email || 'Consultation Channel',
        peerRoleSubtitle: peerUser?.role || (conv.type === 'group' ? 'Group Channel' : 'Encrypted Channel'),
        lastMessageText: latest?.content || '',
        lastMessageAt: latest?.created_at || conv.last_message_at || conv.updated_at,
        unreadCount: unreadByConv.get(conv.id) || 0,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formatted,
      contacts,
    });
  } catch (error: any) {
    console.error('Conversations GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const targetParticipantId = body.participantId || body.caId || body.clientId;
    if (!targetParticipantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    const allowed =
      auth.isAdmin ||
      (await canAccessClientRecord(auth, targetParticipantId)) ||
      (body.clientId ? await canAccessClientRecord(auth, body.clientId) : false);

    // Also allow client messaging an accepted/assigned CA
    const supabase = getServiceClient();
    let isConnectedCa = false;
    if (!allowed && !auth.isCAOrStaff) {
      const { data: rel } = await supabase
        .from('ca_client_relationships')
        .select('id')
        .eq('ca_id', targetParticipantId)
        .eq('client_id', auth.userId)
        .in('status', ['accepted', 'active'])
        .maybeSingle();
      if (rel) isConnectedCa = true;
    }

    if (!allowed && !isConnectedCa) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const participantIds = Array.from(new Set([auth.userId, targetParticipantId]));
    const { data: existingList } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', participantIds)
      .limit(1);

    if (existingList && existingList.length > 0) {
      return NextResponse.json({ success: true, conversation: existingList[0] });
    }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert([
        {
          type: body.type || 'direct',
          title: body.title || null,
          subject: body.subject || null,
          ca_id: auth.isCAOrStaff ? auth.userId : targetParticipantId,
          client_id: body.clientId || (auth.isCAOrStaff ? targetParticipantId : auth.userId),
          participant_ids: participantIds,
          last_message_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conversation: created }, { status: 201 });
  } catch (error: any) {
    console.error('Conversations POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

