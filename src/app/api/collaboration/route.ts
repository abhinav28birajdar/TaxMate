import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch collaboration data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const collaborativeSessions = [
      {
        id: 'col-001',
        type: 'DOCUMENT_REVIEW',
        title: 'GST Filing Review - Client ABC',
        participants: 3,
        startedAt: '2024-04-01T10:00:00Z',
        duration: 45,
        status: 'ACTIVE',
        sharedItems: 4,
      },
      {
        id: 'col-002',
        type: 'CLIENT_MEETING',
        title: 'Q1 Financial Planning',
        participants: 2,
        startedAt: '2024-04-01T14:30:00Z',
        duration: 30,
        status: 'ACTIVE',
        sharedItems: 2,
      },
      {
        id: 'col-003',
        type: 'TEAM_SYNC',
        title: 'Weekly Team Standup',
        participants: 5,
        startedAt: '2024-04-01T09:00:00Z',
        duration: 60,
        status: 'COMPLETED',
        sharedItems: 8,
      },
    ];

    const teamStatus = [
      {
        memberId: 'tm-001',
        name: 'Rajesh Kumar',
        status: 'ONLINE',
        currentActivity: 'Reviewing GST docs',
        availableIn: 0,
      },
      {
        memberId: 'tm-002',
        name: 'Priya Sharma',
        status: 'IN_MEETING',
        currentActivity: 'Client call',
        availableIn: 15,
      },
      {
        memberId: 'tm-003',
        name: 'Amit Singh',
        status: 'OFFLINE',
        currentActivity: 'Break',
        availableIn: 30,
      },
      {
        memberId: 'tm-004',
        name: 'Meera Nair',
        status: 'ONLINE',
        currentActivity: 'Filing audit report',
        availableIn: 0,
      },
    ];

    const sharedProjects = [
      {
        id: 'proj-001',
        name: 'GST Return Filing Q1 2024',
        status: 'IN_PROGRESS',
        progress: 75,
        members: 3,
        documents: 12,
        lastUpdated: '2024-04-01T11:00:00Z',
      },
      {
        id: 'proj-002',
        name: 'Annual Audit 2023-24',
        status: 'IN_PROGRESS',
        progress: 45,
        members: 4,
        documents: 28,
        lastUpdated: '2024-03-31T16:00:00Z',
      },
      {
        id: 'proj-003',
        name: 'Client Onboarding - ABC Corp',
        status: 'COMPLETED',
        progress: 100,
        members: 2,
        documents: 15,
        lastUpdated: '2024-03-28T13:00:00Z',
      },
      {
        id: 'proj-004',
        name: 'Payroll Setup - XYZ Ltd',
        status: 'IN_PROGRESS',
        progress: 60,
        members: 2,
        documents: 8,
        lastUpdated: '2024-04-01T09:30:00Z',
      },
    ];

    const activityFeed = [
      {
        id: 'act-001',
        type: 'DOCUMENT_ADDED',
        actor: 'Rajesh Kumar',
        target: 'GST Return - Q1',
        timestamp: '2024-04-01T11:30:00Z',
        message: 'Added GST return document',
      },
      {
        id: 'act-002',
        type: 'COMMENT_ADDED',
        actor: 'Priya Sharma',
        target: 'Client Meeting Notes',
        timestamp: '2024-04-01T11:15:00Z',
        message: 'Added comment to document',
      },
      {
        id: 'act-003',
        type: 'PROJECT_MILESTONE',
        actor: 'Amit Singh',
        target: 'Annual Audit',
        timestamp: '2024-04-01T10:45:00Z',
        message: 'Marked milestone as complete',
      },
      {
        id: 'act-004',
        type: 'DOCUMENT_SHARED',
        actor: 'Meera Nair',
        target: '5 Compliance Documents',
        timestamp: '2024-04-01T10:00:00Z',
        message: 'Shared 5 documents with team',
      },
      {
        id: 'act-005',
        type: 'TASK_COMPLETED',
        actor: 'Rajesh Kumar',
        target: 'Client Follow-up',
        timestamp: '2024-04-01T09:30:00Z',
        message: 'Completed pending task',
      },
      {
        id: 'act-006',
        type: 'MEETING_SCHEDULED',
        actor: 'Priya Sharma',
        target: 'Client XYZ Meeting',
        timestamp: '2024-04-01T09:00:00Z',
        message: 'Scheduled new meeting',
      },
      {
        id: 'act-007',
        type: 'FILE_APPROVED',
        actor: 'Amit Singh',
        target: 'Audit Report',
        timestamp: '2024-03-31T17:00:00Z',
        message: 'Approved final audit report',
      },
      {
        id: 'act-008',
        type: 'COMMENT_REPLY',
        actor: 'Meera Nair',
        target: 'Review Comments',
        timestamp: '2024-03-31T16:30:00Z',
        message: 'Replied to review comment',
      },
    ];

    const stats = {
      activeSessions: 2,
      onlineMembers: 3,
      totalProjects: 4,
      totalSharedDocuments: 342,
      totalComments: 87,
      avgResponseTime: 2.3,
      collaborationScore: 87.5,
      teamEngagement: 82.3,
    };

    return NextResponse.json({
      activeSessions: collaborativeSessions,
      teamStatus,
      sharedProjects,
      activityFeed,
      stats,
    });
  } catch (error) {
    console.error('Collaboration error:', error);
    return NextResponse.json({ error: 'Failed to fetch collaboration data' }, { status: 500 });
  }
}

// POST - Start collaboration session
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, title, participants } = body;

    return NextResponse.json({
      success: true,
      sessionId: `col-${Date.now()}`,
      status: 'ACTIVE',
      message: 'Collaboration session started',
      joinLink: `https://taxmate.app/collaborate/${Date.now()}`,
    });
  } catch (error) {
    console.error('Collaboration creation error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
