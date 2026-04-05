import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch client matching recommendations
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const matches = [
      {
        id: 'match-001',
        clientName: 'Tech Startup India Ltd',
        clientIndustry: 'Software Development',
        clientLocation: 'Bangalore',
        clientBudget: '2-5L',
        caName: 'Amit Kumar',
        caExperience: 12,
        caSpecialty: 'Tech Startups',
        matchScore: 94,
        matchReasons: ['Same industry', 'Budget fit', 'Location proximity', 'Expertise match'],
        recommendedServices: ['ITR Filing', 'GST Compliance', 'Audit'],
        status: 'MATCHED',
        matchedDate: '2024-03-28',
      },
      {
        id: 'match-002',
        clientName: 'Retail Plus Store',
        clientIndustry: 'Retail',
        clientLocation: 'Mumbai',
        clientBudget: '5-10L',
        caName: 'Priya Sharma',
        caExperience: 8,
        caSpecialty: 'Retail Business',
        matchScore: 89,
        matchReasons: ['Industry expertise', 'Budget range', 'Local presence'],
        recommendedServices: ['GST Filing', 'Accounting', 'Payroll'],
        status: 'MATCHED',
        matchedDate: '2024-03-27',
      },
      {
        id: 'match-003',
        clientName: 'Healthcare Clinic',
        clientIndustry: 'Healthcare',
        clientLocation: 'Delhi',
        clientBudget: '3-7L',
        caName: 'Dr. Rajesh Verma',
        caExperience: 15,
        caSpecialty: 'Medical Services',
        matchScore: 86,
        matchReasons: ['Healthcare expertise', 'Experience level', 'Service fit'],
        recommendedServices: ['ITR Filing', 'Compliance', 'GST'],
        status: 'PENDING',
        matchedDate: '2024-03-30',
      },
      {
        id: 'match-004',
        clientName: 'Manufacturing Co',
        clientIndustry: 'Manufacturing',
        clientLocation: 'Pune',
        clientBudget: '10-20L',
        caName: 'Vikram Singh',
        caExperience: 18,
        caSpecialty: 'Manufacturing',
        matchScore: 92,
        matchReasons: ['Industry match', 'Budget fit', 'Expertise', 'Experience'],
        recommendedServices: ['Audit', 'GST Filing', 'Financial Planning'],
        status: 'MATCHED',
        matchedDate: '2024-03-29',
      },
      {
        id: 'match-005',
        clientName: 'Export Business',
        clientIndustry: 'Import/Export',
        clientLocation: 'Chennai',
        clientBudget: '5-10L',
        caName: 'Meera Nair',
        caExperience: 10,
        caSpecialty: 'Export Services',
        matchScore: 88,
        matchReasons: ['Export expertise', 'Regional presence', 'Service alignment'],
        recommendedServices: ['GST Compliance', 'Export Documentation', 'Audit'],
        status: 'MATCHED',
        matchedDate: '2024-03-25',
      },
    ];

    const stats = {
      totalMatches: matches.length,
      matchedCount: matches.filter((m: any) => m.status === 'MATCHED').length,
      pendingCount: matches.filter((m: any) => m.status === 'PENDING').length,
      avgMatchScore: Math.round(
        matches.reduce((sum: number, m: any) => sum + m.matchScore, 0) / matches.length
      ),
      successRate: 87.5,
      totalClientsMatched: 42,
      totalMatchAttempts: 156,
      conversionRate: 26.9,
      avgTimeToMatch: 3.2,
    };

    return NextResponse.json({
      matches,
      stats,
    });
  } catch (error) {
    console.error('Client matching error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// POST - Find new matches
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { clientId, filters } = body;

    // Simulate finding matches
    const newMatches = generateMatches(5);

    return NextResponse.json({
      success: true,
      matchesFound: newMatches.length,
      matches: newMatches,
      processingTime: 2.3,
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 });
  }
}

function generateMatches(count: number) {
  const industries = [
    'Technology',
    'Retail',
    'Manufacturing',
    'Healthcare',
    'Finance',
    'Education',
  ];
  const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai', 'Hyderabad'];
  const budgets = ['1-3L', '3-5L', '5-10L', '10-20L', '20L+'];

  const matches = [];
  for (let i = 0; i < count; i++) {
    matches.push({
      id: `new-match-${i + 1}`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      budget: budgets[Math.floor(Math.random() * budgets.length)],
      matchScore: Math.round(Math.random() * 25 + 75), // 75-100
      confidence: Math.round(Math.random() * 15 + 85),
    });
  }

  return matches;
}
