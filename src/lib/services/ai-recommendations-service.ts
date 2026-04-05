/**
 * AI Recommendations Service
 * Provides AI-powered recommendations for CAs and clients
 */

import { createClient } from '@/lib/supabase/client';

export interface AIRecommendation {
  id: string;
  type: 'service' | 'compliance' | 'tax_optimization' | 'document' | 'action';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetUserId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  expectedBenefit?: string;
  confidenceScore: number;
  actionItems?: string[];
  dismissed: boolean;
}

export class AIRecommendationService {
  private static instance: AIRecommendationService;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): AIRecommendationService {
    if (!AIRecommendationService.instance) {
      AIRecommendationService.instance = new AIRecommendationService();
    }
    return AIRecommendationService.instance;
  }

  /**
   * Generate service recommendations for a CA
   */
  async generateServiceRecommendations(caId: string): Promise<AIRecommendation[]> {
    try {
      // Get CA profile
      const { data: caProfile } = await this.supabase
        .from('ca_profiles')
        .select('*')
        .eq('id', caId)
        .single();

      if (!caProfile) throw new Error('CA profile not found');

      // Get CA's existing services
      const { data: existingServices } = await this.supabase
        .from('ca_services')
        .select('service_code')
        .eq('ca_id', caId);

      // Get CA's cases and client stats
      const { data: cases } = await this.supabase
        .from('cases')
        .select('service_type', { count: 'exact' })
        .eq('ca_id', caId);

      const existingServiceCodes = existingServices?.map(s => s.service_code) || [];
      const requestedServiceTypes = cases?.map(c => c.service_type) || [];

      // AI Logic: Recommend services based on experience and demand
      const recommendations: AIRecommendation[] = [];

      // If CA has high experience in tax, recommend tax services
      if (caProfile.years_of_experience >= 5 && !existingServiceCodes.includes('TAX_OPTIMIZATION')) {
        recommendations.push({
          id: 'rec_' + Date.now(),
          type: 'service',
          title: 'Add Tax Optimization Service',
          description: 'Based on your experience and client demand, consider offering tax optimization services',
          priority: 'high',
          targetUserId: caProfile.user_id,
          confidenceScore: 0.85,
          expectedBenefit: '25-30% revenue increase',
          actionItems: ['Create service listing', 'Set pricing', 'Add to portfolio'],
        });
      }

      // If CA has many GST cases, recommend GST services
      if (requestedServiceTypes.includes('GST_RETURN')) {
        recommendations.push({
          id: 'rec_' + (Date.now() + 1),
          type: 'service',
          title: 'Premium GST Services Package',
          description: 'Your clients frequently request GST services. Create a comprehensive package',
          priority: 'high',
          targetUserId: caProfile.user_id,
          confidenceScore: 0.9,
          expectedBenefit: 'Increase client retention',
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating service recommendations:', error);
      return [];
    }
  }

  /**
   * Generate compliance recommendations for a client
   */
  async generateComplianceRecommendations(clientId: string): Promise<AIRecommendation[]> {
    try {
      const { data: clientProfile } = await this.supabase
        .from('client_profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!clientProfile) throw new Error('Client profile not found');

      const recommendations: AIRecommendation[] = [];

      // If client is a business, recommend business tax services
      if (clientProfile.is_business) {
        if (clientProfile.business_gstin && !clientProfile.gstin) {
          recommendations.push({
            id: 'rec_' + Date.now(),
            type: 'compliance',
            title: 'GST Registration Required',
            description: 'Your business seems to have GST liability. Please ensure proper GST registration',
            priority: 'critical',
            targetUserId: clientProfile.user_id,
            confidenceScore: 0.95,
            expectedBenefit: 'Legal compliance and tax efficiency',
            actionItems: ['Contact your CA', 'Gather GST details', 'Complete registration'],
          });
        }

        // If business has high turnover, recommend audit services
        if (clientProfile.annual_turnover && clientProfile.annual_turnover > 10000000) {
          recommendations.push({
            id: 'rec_' + (Date.now() + 1),
            type: 'compliance',
            title: 'Statutory Audit Recommended',
            description: 'Based on your business turnover, statutory audit is recommended',
            priority: 'high',
            targetUserId: clientProfile.user_id,
            confidenceScore: 0.88,
            expectedBenefit: 'Ensure compliance and financial credibility',
          });
        }
      }

      // ITR filing recommendation (fiscal year)
      recommendations.push({
        id: 'rec_' + (Date.now() + 2),
        type: 'compliance',
        title: 'Income Tax Return Filing Due Soon',
        description: 'ITR filing deadline is approaching',
        priority: 'high',
        targetUserId: clientProfile.user_id,
        confidenceScore: 0.92,
        expectedBenefit: 'Avoid late filing penalties',
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating compliance recommendations:', error);
      return [];
    }
  }

  /**
   * Generate tax optimization recommendations
   */
  async generateTaxOptimizationRecommendations(clientId: string): Promise<AIRecommendation[]> {
    try {
      const { data: clientProfile } = await this.supabase
        .from('client_profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!clientProfile) throw new Error('Client profile not found');

      const recommendations: AIRecommendation[] = [];

      // If individual with income, recommend tax planning
      if (!clientProfile.is_business) {
        recommendations.push({
          id: 'rec_' + Date.now(),
          type: 'tax_optimization',
          title: 'Tax Planning Opportunity',
          description: 'Explore tax deductions under Section 80C, 80D, etc.',
          priority: 'medium',
          targetUserId: clientProfile.user_id,
          confidenceScore: 0.8,
          expectedBenefit: '15-20% tax saving potential',
          actionItems: ['Review income sources', 'Identify eligible deductions', 'Plan investments'],
        });
      }

      // Business tax optimization
      if (clientProfile.is_business) {
        recommendations.push({
          id: 'rec_' + (Date.now() + 1),
          type: 'tax_optimization',
          title: 'Business Tax Optimization',
          description: 'Review expense deductions and tax planning strategies',
          priority: 'high',
          targetUserId: clientProfile.user_id,
          confidenceScore: 0.85,
          expectedBenefit: '10-25% tax liability reduction',
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating tax optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Generate document upload recommendations
   */
  async generateDocumentRecommendations(caseId: string): Promise<AIRecommendation[]> {
    try {
      const { data: caseData } = await this.supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (!caseData) throw new Error('Case not found');

      const { data: uploadedDocuments } = await this.supabase
        .from('documents')
        .select('category')
        .eq('case_id', caseId);

      const uploadedCategories = uploadedDocuments?.map(d => d.category) || [];
      const recommendations: AIRecommendation[] = [];

      // Recommend missing documents based on service type
      const requiredDocuments: Record<string, string[]> = {
        ITR_FILING: ['PAN', 'Form16', 'BankStatement', 'InvestmentProof'],
        GST_REGISTRATION: ['PAN', 'Aadhar', 'AddressProof', 'BankDetails'],
        PAYROLL: ['EmployeeList', 'SalarySlips', 'BankDetails'],
      };

      const required = requiredDocuments[caseData.service_type] || [];
      const missing = required.filter(doc => !uploadedCategories.includes(doc));

      if (missing.length > 0) {
        recommendations.push({
          id: 'rec_' + Date.now(),
          type: 'document',
          title: `Missing Documents Required for ${caseData.service_type}`,
          description: `Please upload: ${missing.join(', ')}`,
          priority: 'high',
          targetUserId: caseData.client_id,
          relatedEntityType: 'case',
          relatedEntityId: caseId,
          confidenceScore: 0.95,
          actionItems: [`Upload ${missing[0]}`, `Upload ${missing[1] || 'other documents'}`],
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating document recommendations:', error);
      return [];
    }
  }

  /**
   * Generate action recommendations for case completion
   */
  async generateActionRecommendations(caseId: string): Promise<AIRecommendation[]> {
    try {
      const { data: caseData } = await this.supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (!caseData) throw new Error('Case not found');

      const recommendations: AIRecommendation[] = [];
      const today = new Date();
      const deadline = new Date(caseData.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // If deadline is approaching
      if (daysLeft < 7 && daysLeft > 0) {
        recommendations.push({
          id: 'rec_' + Date.now(),
          type: 'action',
          title: 'Case Deadline Approaching',
          description: `Only ${daysLeft} days left to complete this case`,
          priority: daysLeft < 3 ? 'critical' : 'high',
          targetUserId: caseData.ca_id,
          relatedEntityType: 'case',
          relatedEntityId: caseId,
          confidenceScore: 1.0,
          actionItems: ['Review case status', 'Collect pending documents', 'Accelerate work'],
        });
      }

      // If case is in progress for too long
      const createdDate = new Date(caseData.created_at);
      const daysPassed = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (caseData.status === 'in_progress' && daysPassed > 30) {
        recommendations.push({
          id: 'rec_' + (Date.now() + 1),
          type: 'action',
          title: 'Case In Progress For Extended Period',
          description: 'This case has been in progress for over a month. Consider expediting completion.',
          priority: 'medium',
          targetUserId: caseData.ca_id,
          relatedEntityType: 'case',
          relatedEntityId: caseId,
          confidenceScore: 0.8,
          actionItems: ['Schedule review meeting', 'Identify blockers', 'Create action plan'],
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating action recommendations:', error);
      return [];
    }
  }

  /**
   * Get all recommendations for a user
   */
  async getUserRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      // Get user role
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      let recommendations: AIRecommendation[] = [];

      if (user.role === 'ca') {
        const { data: caProfile } = await this.supabase
          .from('ca_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (caProfile) {
          const serviceRecs = await this.generateServiceRecommendations(caProfile.id);
          recommendations.push(...serviceRecs);
        }
      } else if (user.role === 'client') {
        const { data: clientProfile } = await this.supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (clientProfile) {
          const complianceRecs = await this.generateComplianceRecommendations(clientProfile.id);
          const taxRecs = await this.generateTaxOptimizationRecommendations(clientProfile.id);
          recommendations.push(...complianceRecs, ...taxRecs);
        }
      }

      return recommendations.filter(r => !r.dismissed);
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      return [];
    }
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(recommendationId: string): Promise<void> {
    // Store in local storage or database
    const dismissed = JSON.parse(localStorage.getItem('dismissed_recommendations') || '[]');
    dismissed.push(recommendationId);
    localStorage.setItem('dismissed_recommendations', JSON.stringify(dismissed));
  }

  /**
   * Get prioritized recommendations for dashboard
   */
  async getDashboardRecommendations(userId: string, limit: number = 5): Promise<AIRecommendation[]> {
    const recommendations = await this.getUserRecommendations(userId);

    // Sort by priority and confidence score
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return recommendations
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidenceScore - a.confidenceScore;
      })
      .slice(0, limit);
  }
}

export default AIRecommendationService.getInstance();
