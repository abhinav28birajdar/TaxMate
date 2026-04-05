import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch available integrations
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const integrations = [
      {
        id: 'int-razorpay',
        name: 'Razorpay',
        category: 'Payments',
        status: 'CONNECTED',
        connectedDate: '2024-03-15',
        features: ['Payment Processing', 'Invoicing', 'Subscriptions'],
        lastSync: '2024-04-01T11:00:00Z',
        transactionsProcessed: 245,
        successRate: 99.2,
      },
      {
        id: 'int-firebase',
        name: 'Firebase',
        category: 'Notifications',
        status: 'CONNECTED',
        connectedDate: '2024-03-10',
        features: ['Push Notifications', 'Analytics', 'Authentication'],
        lastSync: '2024-04-01T11:30:00Z',
        notificationsDelivered: 1240,
        successRate: 98.8,
      },
      {
        id: 'int-sendgrid',
        name: 'SendGrid',
        category: 'Email',
        status: 'CONNECTED',
        connectedDate: '2024-03-20',
        features: ['Email Delivery', 'Templates', 'Analytics'],
        lastSync: '2024-04-01T12:00:00Z',
        emailsSent: 456,
        deliveryRate: 97.3,
      },
      {
        id: 'int-google-calendar',
        name: 'Google Calendar',
        category: 'Scheduling',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['Calendar Sync', 'Meeting Scheduling', 'Reminders'],
        lastSync: null,
        availableFeatures: 3,
      },
      {
        id: 'int-slack',
        name: 'Slack',
        category: 'Communication',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['Notifications', 'Team Chat', 'Integration Management'],
        lastSync: null,
        availableFeatures: 3,
      },
      {
        id: 'int-zapier',
        name: 'Zapier',
        category: 'Automation',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['Workflow Automation', '5000+ App Connections', 'Custom Actions'],
        lastSync: null,
        availableFeatures: 3,
      },
      {
        id: 'int-aws-s3',
        name: 'AWS S3',
        category: 'Storage',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['File Storage', 'Backup', 'Security'],
        lastSync: null,
        availableFeatures: 3,
      },
      {
        id: 'int-twilio',
        name: 'Twilio',
        category: 'SMS',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['SMS Sending', 'Voice Calls', 'Verification'],
        lastSync: null,
        availableFeatures: 3,
      },
      {
        id: 'int-openai',
        name: 'OpenAI',
        category: 'AI',
        status: 'NOT_CONNECTED',
        connectedDate: null,
        features: ['AI Chatbot', 'Document Analysis', 'Smart Suggestions'],
        lastSync: null,
        availableFeatures: 3,
      },
    ];

    const stats = {
      connected: integrations.filter((i: any) => i.status === 'CONNECTED').length,
      total: integrations.length,
      transactionsProcessed: 1941,
      notificationsDelivered: 3456,
    };

    return NextResponse.json({
      integrations,
      stats,
      recommendations: [
        'Connect Google Calendar for better scheduling',
        'Enable Slack for team notifications',
        'Setup Zapier for advanced automation',
      ],
    });
  } catch (error) {
    console.error('Integration error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST - Connect integration
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { integrationId, credentials } = body;

    return NextResponse.json({
      success: true,
      message: `Integration ${integrationId} connected successfully`,
      redirectUrl: `https://auth.service.com/callback?integration=${integrationId}`,
    });
  } catch (error) {
    console.error('Integration connection error:', error);
    return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 });
  }
}
