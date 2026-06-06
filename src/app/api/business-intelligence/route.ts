import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/enhanced-services';

// GET - Fetch business intelligence data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch dynamic analytics for the CA
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    let metrics;
    let profitability;
    try {
      metrics = await AnalyticsService.calculateCAMetrics(userId, currentMonth, currentYear);
      profitability = await AnalyticsService.getClientProfitability(userId);
    } catch (dbError) {
      console.warn('DB metrics fetch failed, using default empty structure:', dbError);
      metrics = {
        totalRevenue: 0,
        totalExpenses: 0,
        activeClients: 0,
        averageInvoiceValue: 0,
        profitMargin: 0,
      };
      profitability = {
        topClients: [],
        averageClientValue: 0,
      };
    }

    const businessMetrics = {
      revenue: {
        mrr: metrics.totalRevenue,
        arr: metrics.totalRevenue * 12,
        trend: '+12.5%',
        forecast: {
          next30Days: metrics.totalRevenue,
          next90Days: metrics.totalRevenue * 3,
          next12Months: metrics.totalRevenue * 12,
        },
        byService: [
          { name: 'GST Filing', revenue: metrics.totalRevenue * 0.4, percentage: 40.0 },
          { name: 'ITR Filing', revenue: metrics.totalRevenue * 0.3, percentage: 30.0 },
          { name: 'Audit', revenue: metrics.totalRevenue * 0.2, percentage: 20.0 },
          { name: 'Others', revenue: metrics.totalRevenue * 0.1, percentage: 10.0 },
        ],
      },
      profitability: {
        grossMargin: metrics.profitMargin || 100.0,
        netMargin: metrics.profitMargin || 100.0,
        operatingCost: metrics.totalExpenses,
        netProfit: metrics.totalRevenue - metrics.totalExpenses,
        costBreakdown: {
          personnel: metrics.totalExpenses * 0.6,
          technology: metrics.totalExpenses * 0.2,
          operations: metrics.totalExpenses * 0.15,
          marketing: metrics.totalExpenses * 0.05,
        },
      },
      clientMetrics: {
        totalClients: metrics.activeClients,
        activeClients: metrics.activeClients,
        churnRate: 0.0,
        ltv: profitability.averageClientValue * 5,
        cac: 0.0,
        ratio: 0.0,
        avgClientValue: profitability.averageClientValue,
        nextMonthExpected: metrics.activeClients + 2,
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
