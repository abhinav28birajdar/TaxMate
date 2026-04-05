import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch business intelligence data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessMetrics = {
      revenue: {
        mrr: 485000,
        arr: 5820000,
        trend: '+12.5%',
        forecast: {
          next30Days: 385000,
          next90Days: 1155000,
          next12Months: 6800000,
        },
        byService: [
          { name: 'GST Filing', revenue: 180000, percentage: 37.1 },
          { name: 'ITR Filing', revenue: 135000, percentage: 27.8 },
          { name: 'Audit', revenue: 120000, percentage: 24.7 },
          { name: 'Others', revenue: 50000, percentage: 10.3 },
        ],
      },
      profitability: {
        grossMargin: 68.5,
        netMargin: 42.3,
        operatingCost: 152500,
        netProfit: 205025,
        costBreakdown: {
          personnel: 85000,
          technology: 35000,
          operations: 25000,
          marketing: 7500,
        },
      },
      clientMetrics: {
        totalClients: 42,
        activeClients: 38,
        churnRate: 3.5,
        ltv: 285000,
        cac: 12000,
        ratio: 23.75,
        avgClientValue: 13809.5,
        nextMonthExpected: 45,
      },
      operationalMetrics: {
        avgServiceDeliveryTime: 12.5,
        documentProcessingAccuracy: 96.8,
        clientSatisfaction: 4.7,
        taskCompletionRate: 92.3,
        complianceAdherence: 94.2,
      },
    };

    const competitors = [
      {
        name: 'Taxmate',
        score: 89.2,
        features: 70,
        pricing: 'Competitive',
        market: '12%',
        trend: '+15%',
        status: 'YOU',
      },
      {
        name: 'CA Master',
        score: 82.5,
        features: 56,
        pricing: 'Premium',
        market: '18%',
        trend: '+5%',
      },
      {
        name: 'Quick Ledger',
        score: 78.3,
        features: 48,
        pricing: 'Budget',
        market: '22%',
        trend: '+8%',
      },
      {
        name: 'Financial Pro',
        score: 85.7,
        features: 62,
        pricing: 'Competitive',
        market: '15%',
        trend: '+3%',
      },
    ];

    const marketOpportunities = [
      {
        id: 'opp-001',
        title: 'Startup GST Compliance',
        market: 'Growing',
        demand: 'High',
        competition: 'Medium',
        revenue: '2-5L',
        feasibility: 85,
      },
      {
        id: 'opp-002',
        title: 'Export Documentation',
        market: 'Niche',
        demand: 'Medium',
        competition: 'Low',
        revenue: '1-3L',
        feasibility: 72,
      },
      {
        id: 'opp-003',
        title: 'Payroll Solutions',
        market: 'Expanding',
        demand: 'High',
        competition: 'High',
        revenue: '3-6L',
        feasibility: 78,
      },
      {
        id: 'opp-004',
        title: 'Due Diligence',
        market: 'Growing',
        demand: 'High',
        competition: 'Medium',
        revenue: '5-10L',
        feasibility: 82,
      },
    ];

    const insights = [
      {
        id: 'insight-001',
        type: 'OPPORTUNITY',
        title: 'GST Revenue Opportunity',
        description: 'GST filing services have highest ROI (68.5% margin)',
        impact: 'High',
        action: 'Focus on GST market expansion',
      },
      {
        id: 'insight-002',
        type: 'RISK',
        title: 'Client Churn Alert',
        description: '3 high-value clients showing inactivity',
        impact: 'Medium',
        action: 'Schedule retention calls',
      },
      {
        id: 'insight-003',
        type: 'OPPORTUNITY',
        title: 'Upsell Opportunity',
        description: '15 clients eligible for premium services',
        impact: 'High',
        action: 'Launch upsell campaign',
      },
      {
        id: 'insight-004',
        type: 'EFFICIENCY',
        title: 'Document Processing Peak',
        description: 'Peak processing time 2:30-4:00 PM',
        impact: 'Low',
        action: 'Optimize resource allocation',
      },
    ];

    return NextResponse.json({
      businessMetrics,
      competitors,
      marketOpportunities,
      insights,
      healthScore: {
        overall: 87.5,
        revenue: 92,
        profitability: 85,
        clientSatisfaction: 94,
        operationalEfficiency: 87,
        compliance: 96,
      },
    });
  } catch (error) {
    console.error('Business intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business intelligence' },
      { status: 500 }
    );
  }
}
