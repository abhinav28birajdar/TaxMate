import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch client portal data
export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id');
    if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portalData = {
      clientInfo: {
        name: 'ABC Enterprises',
        type: 'BUSINESS',
        gstNumber: '27ABC1234D12Z5',
        panNumber: 'ABCD1234E',
        accountStatus: 'ACTIVE',
        since: '2023-06-15',
        ca: 'Rajesh Kumar',
      },
      dashboard: {
        pendingDocuments: 4,
        upcomingDeadlines: 3,
        filingStatus: {
          lastGSTFiling: '2024-03-31',
          nextGSTDue: '2024-04-20',
          lastITRFiling: '2024-01-15',
          nextITRDue: '2024-12-31',
        },
        recentInvoices: [
          { id: 'inv-001', date: '2024-04-01', amount: 50000, status: 'PAID' },
          { id: 'inv-002', date: '2024-03-01', amount: 75000, status: 'PAID' },
          { id: 'inv-003', date: '2024-02-01', amount: 60000, status: 'PAID' },
        ],
      },
      documents: {
        pending: [
          { id: 'doc-001', name: 'Bank Statements - March 2024', dueDate: '2024-04-05', category: 'Bank Statements' },
          { id: 'doc-002', name: 'Expense Receipts', dueDate: '2024-04-10', category: 'Expense' },
          { id: 'doc-003', name: 'Invoice Register', dueDate: '2024-04-08', category: 'Invoices' },
          { id: 'doc-004', name: 'GST Reconciliation', dueDate: '2024-04-06', category: 'GST' },
        ],
        uploaded: 24,
        verified: 22,
        pending: 2,
        byCategory: [
          { category: 'GST Documents', count: 12, status: 'VERIFIED' },
          { category: 'Bank Statements', count: 6, status: 'VERIFIED' },
          { category: 'Invoices', count: 4, status: 'PENDING' },
          { category: 'PAN Card', count: 1, status: 'VERIFIED' },
          { category: 'Other', count: 1, status: 'VERIFIED' },
        ],
      },
      communications: {
        unreadMessages: 2,
        lastMessage: '2024-04-01T14:30:00Z',
        threads: 5,
        documents: 12,
      },
      compliance: {
        status: 'ON_TRACK',
        score: 92.5,
        items: [
          { name: 'GST Filing', status: 'COMPLETED', date: '2024-03-31', nextDue: '2024-04-20' },
          { name: 'GST Payment', status: 'COMPLETED', date: '2024-04-01', nextDue: 'N/A' },
          { name: 'Monthly Report Submission', status: 'COMPLETED', date: '2024-04-01', nextDue: '2024-05-01' },
          { name: 'TDS Filing', status: 'PENDING', date: null, nextDue: '2024-04-31' },
          { name: 'PF Compliance', status: 'COMPLETED', date: '2024-03-30', nextDue: '2024-04-30' },
        ],
      },
      tasks: {
        assigned: 8,
        completed: 6,
        pending: 2,
        recent: [
          { id: 'task-001', title: 'Submit Bank Statements', status: 'PENDING', dueDate: '2024-04-05', priority: 'HIGH' },
          { id: 'task-002', title: 'Review GST Report', status: 'PENDING', dueDate: '2024-04-06', priority: 'MEDIUM' },
          { id: 'task-003', title: 'Upload Invoice Register', status: 'COMPLETED', dueDate: '2024-03-31', priority: 'HIGH' },
          { id: 'task-004', title: 'Approve Expense Report', status: 'COMPLETED', dueDate: '2024-03-30', priority: 'MEDIUM' },
        ],
      },
      invoices: {
        total: 12,
        paid: 10,
        pending: 1,
        overdue: 1,
        totalAmount: 720000,
        paidAmount: 600000,
        pendingAmount: 60000,
        overdueAmount: 60000,
      },
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        documentUploadReminders: 'ENABLED',
        filingReminders: 'ENABLED',
        paymentReminders: 'ENABLED',
        twoFactorAuth: 'ENABLED',
      },
    };

    return NextResponse.json(portalData);
  } catch (error) {
    console.error('Client portal error:', error);
    return NextResponse.json({ error: 'Failed to fetch portal data' }, { status: 500 });
  }
}

// POST - Update client portal data
export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id');
    if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, data } = body;

    return NextResponse.json({
      success: true,
      message: `Portal ${action} updated successfully`,
    });
  } catch (error) {
    console.error('Portal update error:', error);
    return NextResponse.json({ error: 'Failed to update portal' }, { status: 500 });
  }
}
