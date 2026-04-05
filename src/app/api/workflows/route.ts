import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch active workflows
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const workflows = [
      {
        id: 'wf-001',
        name: 'Monthly GST Filing',
        description: 'Automated monthly GST return filing',
        status: 'ACTIVE',
        trigger: 'Monthly (1st of month)',
        actions: [
          { type: 'COLLECT_DOCUMENTS', status: 'ACTIVE' },
          { type: 'VALIDATE_DATA', status: 'ACTIVE' },
          { type: 'GENERATE_RETURN', status: 'ACTIVE' },
          { type: 'SEND_NOTIFICATION', status: 'ACTIVE' },
        ],
        successRate: 99.2,
        executions: 12,
        lastRun: '2024-04-01T09:30:00Z',
        nextRun: '2024-05-01T09:00:00Z',
      },
      {
        id: 'wf-002',
        name: 'Invoice Generation & Reminders',
        description: 'Auto-generate invoices and send reminders',
        status: 'ACTIVE',
        trigger: 'Weekly (Every Monday)',
        actions: [
          { type: 'GENERATE_INVOICES', status: 'ACTIVE' },
          { type: 'SEND_EMAIL', status: 'ACTIVE' },
          { type: 'UPDATE_RECORDS', status: 'ACTIVE' },
        ],
        successRate: 98.5,
        executions: 52,
        lastRun: '2024-03-31T08:00:00Z',
        nextRun: '2024-04-07T08:00:00Z',
      },
      {
        id: 'wf-003',
        name: 'Document Expiry Alerts',
        description: 'Alert for expiring documents',
        status: 'ACTIVE',
        trigger: 'Daily (9:00 AM)',
        actions: [
          { type: 'CHECK_EXPIRY', status: 'ACTIVE' },
          { type: 'SEND_ALERT', status: 'ACTIVE' },
          { type: 'CREATE_TASK', status: 'ACTIVE' },
        ],
        successRate: 99.8,
        executions: 365,
        lastRun: '2024-04-01T09:00:00Z',
        nextRun: '2024-04-02T09:00:00Z',
      },
      {
        id: 'wf-004',
        name: 'Payment Due Notifications',
        description: 'Send payment reminders',
        status: 'ACTIVE',
        trigger: 'Every 3 days',
        actions: [
          { type: 'CHECK_OVERDUE', status: 'ACTIVE' },
          { type: 'SEND_SMS', status: 'ACTIVE' },
          { type: 'SEND_EMAIL', status: 'ACTIVE' },
        ],
        successRate: 97.3,
        executions: 122,
        lastRun: '2024-03-31T10:00:00Z',
        nextRun: '2024-04-03T10:00:00Z',
      },
      {
        id: 'wf-005',
        name: 'Quarterly Compliance Review',
        description: 'Review quarterly compliance',
        status: 'ACTIVE',
        trigger: 'Quarterly (1st of month)',
        actions: [
          { type: 'CHECK_COMPLIANCE', status: 'ACTIVE' },
          { type: 'GENERATE_REPORT', status: 'ACTIVE' },
          { type: 'NOTIFY_CA', status: 'ACTIVE' },
        ],
        successRate: 96.5,
        executions: 4,
        lastRun: '2024-04-01T14:00:00Z',
        nextRun: '2024-07-01T09:00:00Z',
      },
      {
        id: 'wf-006',
        name: 'Client Onboarding',
        description: 'Complete client onboarding workflow',
        status: 'ACTIVE',
        trigger: 'Manual (On new client)',
        actions: [
          { type: 'SEND_WELCOME', status: 'ACTIVE' },
          { type: 'CREATE_FOLDERS', status: 'ACTIVE' },
          { type: 'REQUEST_DOCUMENTS', status: 'ACTIVE' },
          { type: 'SCHEDULE_CALL', status: 'ACTIVE' },
        ],
        successRate: 100,
        executions: 24,
        lastRun: '2024-03-31T11:00:00Z',
        nextRun: null,
      },
    ];

    const stats = {
      total: workflows.length,
      active: workflows.filter((w: any) => w.status === 'ACTIVE').length,
      totalExecutions: workflows.reduce((sum: number, w: any) => sum + w.executions, 0),
      avgSuccessRate: Math.round(
        workflows.reduce((sum: number, w: any) => sum + w.successRate, 0) / workflows.length
      ),
      hoursAutomated: Math.round(
        workflows.reduce((sum: number, w: any) => sum + w.executions * 1.5, 0)
      ),
      timeSaved: 142,
      failureRate: 0.8,
    };

    return NextResponse.json({
      workflows,
      stats,
      automationScore: 92.3,
    });
  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST - Create or trigger workflow
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { workflowId, action } = body;

    if (action === 'TRIGGER') {
      return NextResponse.json({
        success: true,
        executionId: `exec-${Date.now()}`,
        status: 'RUNNING',
        message: `Workflow ${workflowId} triggered successfully`,
        estimatedDuration: Math.random() * 15 + 5,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Workflow creation error:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
