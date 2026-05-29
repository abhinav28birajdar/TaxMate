/**
 * Analytics Service
 * Provides comprehensive analytics for CAs and their cases
 */

import { createClient } from '@/utils/supabase/client';

export interface CaseMetrics {
  caseId: string;
  caId: string;
  daysToStart: number;
  daysToComplete: number;
  totalMessages: number;
  totalDocuments: number;
  clientRating: number;
  finalAmount: number;
}

export interface CAPerformance {
  caId: string;
  activeCases: number;
  completedCases: number;
  completionRate: number;
  averageRating: number;
  totalClients: number;
  avgResponseTime: number;
  dailyRevenue: number;
}

export interface ClientEngagement {
  clientId: string;
  totalCAs: number;
  activeCases: number;
  completedCases: number;
  documentsUploaded: number;
  appointmentsScheduled: number;
  engagementScore: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get case analytics for a specific case
   */
  async getCaseMetrics(caseId: string): Promise<CaseMetrics> {
    const { data: caseData, error: caseError } = await this.supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    const { data: activities, error: activitiesError } = await this.supabase
      .from('case_activities')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId);

    if (activitiesError) throw activitiesError;

    const { data: documents, error: documentsError } = await this.supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId);

    if (documentsError) throw documentsError;

    const { data: messages, error: messagesError } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', (
        await this.supabase
          .from('conversations')
          .select('id')
          .eq('case_id', caseId)
          .single()
      ).data?.id);

    const { data: reviews } = await this.supabase
      .from('ca_reviews')
      .select('rating')
      .eq('case_id', caseId);

    const daysToStart = caseData.started_at
      ? Math.floor((new Date(caseData.started_at).getTime() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const daysToComplete = caseData.completed_at && caseData.started_at
      ? Math.floor((new Date(caseData.completed_at).getTime() - new Date(caseData.started_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      caseId,
      caId: caseData.ca_id,
      daysToStart: daysToStart || 0,
      daysToComplete: daysToComplete || 0,
      totalMessages: messages?.length || 0,
      totalDocuments: documents?.length || 0,
      clientRating: reviews?.[0]?.rating || 0,
      finalAmount: caseData.final_amount,
    };
  }

  /**
   * Get CA performance metrics
   */
  async getCAPerformance(caId: string): Promise<CAPerformance> {
    const { data: caData, error: caError } = await this.supabase
      .from('ca_profiles')
      .select('*')
      .eq('id', caId)
      .single();

    if (caError) throw caError;

    const { data: cases } = await this.supabase
      .from('cases')
      .select('*')
      .eq('ca_id', caId);

    const { data: relationships } = await this.supabase
      .from('ca_client_relationships')
      .select('*', { count: 'exact' })
      .eq('ca_id', caId)
      .eq('status', 'accepted');

    const activeCases = cases?.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length || 0;
    const completedCases = cases?.filter(c => c.status === 'completed').length || 0;
    const completionRate = cases && cases.length > 0 ? (completedCases / cases.length) * 100 : 0;

    return {
      caId,
      activeCases,
      completedCases,
      completionRate,
      averageRating: caData.average_rating,
      totalClients: relationships?.length || 0,
      avgResponseTime: caData.avg_response_time,
      dailyRevenue: 0, // Calculate based on invoices
    };
  }

  /**
   * Get client engagement metrics
   */
  async getClientEngagement(clientId: string): Promise<ClientEngagement> {
    const { data: relationships } = await this.supabase
      .from('ca_client_relationships')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('status', 'accepted');

    const { data: cases } = await this.supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId);

    const { data: documents } = await this.supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId);

    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId);

    const activeCases = cases?.filter(c => c.status !== 'completed').length || 0;
    const completedCases = cases?.filter(c => c.status === 'completed').length || 0;
    const totalActivity = (documents?.length || 0) + (appointments?.length || 0) + (activeCases || 0);
    const engagementScore = Math.min((totalActivity / 100) * 100, 100);

    return {
      clientId,
      totalCAs: relationships?.length || 0,
      activeCases,
      completedCases,
      documentsUploaded: documents?.length || 0,
      appointmentsScheduled: appointments?.length || 0,
      engagementScore,
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate: string, endDate: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('issue_date, total_amount, status')
      .gte('issue_date', startDate)
      .lte('issue_date', endDate)
      .in('status', ['paid', 'partially_paid']);

    if (error) throw error;

    const dailyRevenue = data?.reduce((acc: Record<string, number>, invoice) => {
      const date = invoice.issue_date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += invoice.total_amount;
      return acc;
    }, {});

    const totalRevenue = Object.values(dailyRevenue || {}).reduce((sum: number, amount: any) => sum + amount, 0);

    return {
      totalRevenue,
      dailyRevenue,
      invoiceCount: data?.length || 0,
      avgInvoiceAmount: data && data.length > 0 ? totalRevenue / data.length : 0,
    };
  }

  /**
   * Get case completion trends
   */
  async getCaseCompletionTrends(caId: string, months: number = 12): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await this.supabase
      .from('cases')
      .select('created_at, completed_at, status')
      .eq('ca_id', caId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const trends = data?.reduce((acc: Record<string, { created: number; completed: number }>, caseData) => {
      const month = new Date(caseData.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { created: 0, completed: 0 };
      }
      acc[month].created++;
      if (caseData.status === 'completed') {
        acc[month].completed++;
      }
      return acc;
    }, {});

    return trends;
  }

  /**
   * Get case status distribution
   */
  async getCaseStatusDistribution(caId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('cases')
      .select('status', { count: 'exact' })
      .eq('ca_id', caId);

    if (error) throw error;

    const distribution = data?.reduce((acc: Record<string, number>, caseData) => {
      if (!acc[caseData.status]) {
        acc[caseData.status] = 0;
      }
      acc[caseData.status]++;
      return acc;
    }, {});

    return distribution;
  }

  /**
   * Get client acquisition trends
   */
  async getClientAcquisitionTrends(caId: string, months: number = 12): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await this.supabase
      .from('ca_client_relationships')
      .select('connected_at')
      .eq('ca_id', caId)
      .eq('status', 'accepted')
      .gte('connected_at', startDate.toISOString());

    if (error) throw error;

    const trends = data?.reduce((acc: Record<string, number>, rel) => {
      const month = new Date(rel.connected_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month]++;
      return acc;
    }, {});

    return trends;
  }

  /**
   * Generate dashboard summary
   */
  async getDashboardSummary(userId: string, role: string): Promise<any> {
    if (role === 'ca') {
      const { data: caProfile } = await this.supabase
        .from('ca_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (caProfile) {
      const performance = await this.getCAPerformance(caProfile.id);
        const { data: cases, error: casesError } = await this.supabase
          .from('cases')
          .select('*', { count: 'exact' })
          .eq('ca_id', caProfile.id);

        return {
          ...performance,
          totalCases: cases?.length || 0,
          lastUpdated: new Date().toISOString(),
        };
      }
    } else if (role === 'client') {
      const { data: clientProfile } = await this.supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (clientProfile) {
        return await this.getClientEngagement(clientProfile.id);
      }
    }

    return null;
  }
}

export default AnalyticsService.getInstance();
