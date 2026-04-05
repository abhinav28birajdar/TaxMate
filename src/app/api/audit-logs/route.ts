import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const auditLogs = [
      {
        id: 'log-001',
        timestamp: '2024-04-01T14:30:00Z',
        user: 'Rajesh Kumar',
        action: 'DOCUMENT_UPLOADED',
        resource: 'GST Preparation',
        details: 'Uploaded GST filing document',
        severity: 'INFO',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'log-002',
        timestamp: '2024-04-01T14:25:00Z',
        user: 'Priya Sharma',
        action: 'CLIENT_CREATED',
        resource: 'Client ABC',
        details: 'New client added to system',
        severity: 'INFO',
        ipAddress: '192.168.1.101',
      },
      {
        id: 'log-003',
        timestamp: '2024-04-01T14:20:00Z',
        user: 'Amit Singh',
        action: 'INVOICE_GENERATED',
        resource: 'Invoice INV-2024-001',
        details: 'Generated invoice for client',
        severity: 'INFO',
        ipAddress: '192.168.1.102',
      },
      {
        id: 'log-004',
        timestamp: '2024-04-01T14:15:00Z',
        user: 'Meera Nair',
        action: 'COMPLIANCE_CHECKED',
        resource: 'Compliance GST',
        details: 'Compliance report generated',
        severity: 'INFO',
        ipAddress: '192.168.1.103',
      },
      {
        id: 'log-005',
        timestamp: '2024-04-01T14:10:00Z',
        user: 'System',
        action: 'WORKFLOW_EXECUTED',
        resource: 'Monthly GST Filing',
        details: 'Workflow executed successfully',
        severity: 'INFO',
        ipAddress: 'SYSTEM',
      },
      {
        id: 'log-006',
        timestamp: '2024-04-01T14:05:00Z',
        user: 'Rajesh Kumar',
        action: 'TASK_ASSIGNED',
        resource: 'Task #142',
        details: 'Task assigned to team member',
        severity: 'INFO',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'log-007',
        timestamp: '2024-04-01T14:00:00Z',
        user: 'Priya Sharma',
        action: 'DOCUMENT_SHARED',
        resource: 'Client Portfolio',
        details: 'Document shared with client',
        severity: 'INFO',
        ipAddress: '192.168.1.101',
      },
      {
        id: 'log-008',
        timestamp: '2024-04-01T13:55:00Z',
        user: 'Audit System',
        action: 'SECURITY_CHECK',
        resource: 'System Security',
        details: 'Security scan completed',
        severity: 'SUCCESS',
        ipAddress: 'SYSTEM',
      },
    ];

    const compliance = {
      auditTrailCompleteness: 99.8,
      logRetentionDays: 730,
      complianceStandards: ['ISO 27001', 'GDPR', 'SOC 2'],
      lastAudit: '2024-03-25',
      nextAudit: '2024-06-25',
      violations: 0,
      warnings: 0,
      dataEncryption: 'AES-256',
      backupFrequency: 'Hourly',
      lastBackup: '2024-04-01T14:00:00Z',
    };

    const security = {
      failedLoginAttempts: 2,
      successfulLogins: 456,
      loginSuccessRate: 99.56,
      activeDevices: 8,
      unusualActivities: 0,
      suspiciousIPs: 0,
      dataAccessPatterns: 'Normal',
      twoFactorEnablement: 95,
      passwordPolicyCompliance: 100,
      dataBreachRisks: 'LOW',
    };

    const stats = {
      totalLogs: auditLogs.length,
      logsThisMonth: 125,
      averagePerDay: 4.2,
      criticalEvents: 0,
      warningEvents: 0,
      infoEvents: auditLogs.length,
      systemHealth: '99.76%',
      complianceScore: 97.5,
    };

    return NextResponse.json({
      logs: auditLogs,
      compliance,
      security,
      stats,
    });
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// POST - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, resource, details } = body;

    return NextResponse.json({
      success: true,
      logId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: 'Audit log created',
    });
  } catch (error) {
    console.error('Audit log creation error:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
