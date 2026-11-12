import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getResolvedClientIdsForUser, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function buildDomainFallbackReply(
  query: string,
  role: string,
  stats: {
    openTasks: number;
    pendingFilings: number;
    upcomingDeadlines: Array<{ title: string; due_date: string }>;
    unpaidInvoices: number;
  }
): string {
  const q = query.toLowerCase();
  const nextDeadlineText =
    stats.upcomingDeadlines.length > 0
      ? stats.upcomingDeadlines
          .slice(0, 3)
          .map((d) => `• ${d.title} (Due: ${d.due_date})`)
          .join('\n')
      : '• No pending compliance deadlines found in your workspace.';

  if (q.includes('gst') || q.includes('gstr')) {
    return [
      '**GST Filing & Compliance Guidance:**',
      '• **GSTR-1** (Outward Supplies): Generally due on the **11th** of the following month (or 13th under QRMP). Verify B2B GSTINs and HSN summaries before locking.',
      '• **GSTR-3B** (Summary & Tax Payment): Generally due on the **20th** of the following month (22nd/24th under QRMP). Always reconcile ITC against GSTR-2B before offsetting liability.',
      '• **GSTR-9** (Annual Return): Due **31st December** following the end of the financial year.',
      '',
      `**Your Workspace Snapshot:** You currently have **${stats.pendingFilings} pending filing(s)** and **${stats.openTasks} open task(s)**.`,
      nextDeadlineText,
    ].join('\n');
  }

  if (q.includes('itr') || q.includes('income tax') || q.includes('80c') || q.includes('regime')) {
    return [
      '**Income Tax & Regime Advisory (India):**',
      '• **Old Regime** allows deductions like Section 80C (₹1.5L), 80D (Health Insurance), HRA, and 24(b) home loan interest.',
      '• **New Regime (Default under Sec 115BAC)** offers lower slab rates and a ₹75,000 standard deduction for salaried taxpayers, with most Chapter VI-A deductions disabled.',
      '• **ITR Forms:** ITR-1 (resident salaried <= ₹50L), ITR-2 (capital gains / >1 house), ITR-3 (business/profession), ITR-4 (presumptive 44AD/44ADA).',
      '',
      `**Your Workspace Snapshot:** Open tasks: **${stats.openTasks}**, Pending filings: **${stats.pendingFilings}**.`,
      nextDeadlineText,
    ].join('\n');
  }

  if (q.includes('tds') || q.includes('deduct') || q.includes('194')) {
    return [
      '**TDS Compliance Summary:**',
      '• **Monthly TDS Deposit (Challan 281):** Due by the **7th** of the succeeding month (30th April for March).',
      '• **Quarterly Returns (24Q/26Q):** Due 31st July (Q1), 31st Oct (Q2), 31st Jan (Q3), and 31st May (Q4).',
      '• Key sections: **194C** (Contractors 1%/2%), **194J** (Professional fees 10%, Technical 2%), **194I** (Rent 2%/10%).',
      '',
      nextDeadlineText,
    ].join('\n');
  }

  if (q.includes('deadline') || q.includes('due') || q.includes('calendar') || q.includes('summary') || q.includes('status')) {
    return [
      `**Live Workspace Compliance Summary (${role}):**`,
      `• Open Tasks: **${stats.openTasks}**`,
      `• Pending Tax Filings: **${stats.pendingFilings}**`,
      `• Unpaid Invoices: **${stats.unpaidInvoices}**`,
      '',
      '**Upcoming Deadlines:**',
      nextDeadlineText,
    ].join('\n');
  }

  return [
    `Here is an overview based on your TaxMate **${role}** workspace:`,
    `• **Open Tasks:** ${stats.openTasks}`,
    `• **Pending Tax Filings (GST/ITR):** ${stats.pendingFilings}`,
    `• **Unpaid Invoices:** ${stats.unpaidInvoices}`,
    '',
    '**Upcoming Compliance Deadlines:**',
    nextDeadlineText,
    '',
    'Ask me specifically about **GSTR-1/3B reconciliation**, **ITR old vs new regime comparison**, **TDS due dates**, or your **pending deadlines**.',
  ].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const message = String(body.message || '').trim();
    const history: ChatTurn[] = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const clientIds = auth.role === 'CLIENT' ? await getResolvedClientIdsForUser(auth.userId) : [];

    const tasksQuery =
      auth.role === 'CLIENT'
        ? supabase.from('tasks').select('id', { count: 'exact', head: true }).in('client_id', clientIds).neq('status', 'COMPLETED')
        : supabase.from('tasks').select('id', { count: 'exact', head: true }).or(`ca_id.eq.${auth.userId},assigned_to.eq.${auth.userId}`).neq('status', 'COMPLETED');

    const filingsQuery =
      auth.role === 'CLIENT'
        ? supabase.from('tax_filings').select('id', { count: 'exact', head: true }).in('client_id', clientIds).neq('status', 'COMPLETED')
        : supabase.from('tax_filings').select('id', { count: 'exact', head: true }).eq('ca_id', auth.userId).neq('status', 'COMPLETED');

    const invoicesQuery =
      auth.role === 'CLIENT'
        ? supabase.from('invoices').select('id', { count: 'exact', head: true }).in('client_id', clientIds).neq('status', 'PAID')
        : supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('ca_id', auth.userId).neq('status', 'PAID');

    const deadlinesQuery =
      auth.role === 'CLIENT'
        ? supabase
            .from('compliance_deadlines')
            .select('title, due_date, status')
            .in('client_id', clientIds)
            .neq('status', 'completed')
            .order('due_date', { ascending: true })
            .limit(5)
        : supabase
            .from('compliance_deadlines')
            .select('title, due_date, status')
            .or(`ca_id.eq.${auth.userId},client_id.eq.${auth.userId}`)
            .neq('status', 'completed')
            .order('due_date', { ascending: true })
            .limit(5);

    const [tasksRes, filingsRes, invoicesRes, deadlinesRes] = await Promise.all([
      tasksQuery,
      filingsQuery,
      invoicesQuery,
      deadlinesQuery,
    ]);

    const stats = {
      openTasks: tasksRes.count || 0,
      pendingFilings: filingsRes.count || 0,
      unpaidInvoices: invoicesRes.count || 0,
      upcomingDeadlines: (deadlinesRes.data || []).map((d: any) => ({
        title: d.title || 'Compliance Item',
        due_date: d.due_date || 'TBD',
      })),
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes('placeholder') && !geminiKey.includes('mock')) {
      try {
        const systemContext = [
          `You are TaxMate AI, an expert Indian Chartered Accountancy, GST, Income Tax (ITR), TDS, and ROC compliance assistant.`,
          `User Role: ${auth.role}.`,
          `Live User Workspace Context: Open tasks=${stats.openTasks}, Pending tax filings=${stats.pendingFilings}, Unpaid invoices=${stats.unpaidInvoices}.`,
          `Upcoming deadlines: ${JSON.stringify(stats.upcomingDeadlines)}.`,
          `Give concise, accurate Indian tax guidance. Remind the user to confirm final statutory filings with their practicing CA before submission when appropriate.`,
        ].join(' ');

        const contents = [
          ...history.map((turn) => ({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemContext }] },
              contents,
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText =
            data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
          if (replyText.trim()) {
            return NextResponse.json({
              success: true,
              reply: replyText.trim(),
              source: 'gemini',
              workspaceContext: stats,
            });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini call fell back to structured workspace advisor:', aiErr);
      }
    }

    const fallbackReply = buildDomainFallbackReply(message, auth.role, stats);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      source: 'workspace-advisor',
      workspaceContext: stats,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

