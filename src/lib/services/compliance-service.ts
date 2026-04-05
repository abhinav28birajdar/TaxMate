/**
 * Compliance Service
 * Handles compliance deadline tracking, automation, and tax calendar management
 */

import { createClient } from '@/utils/supabase/client';
import { createServerSupabaseClient } from '@lib/supabase/server';

export interface ComplianceDeadline {
  id: string;
  title: string;
  description?: string;
  deadline_type: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'extended';
  client_id?: string;
  case_id?: string;
  is_automated: boolean;
  reminder_days?: number[];
}

export interface ComplianceAutomationRule {
  id: string;
  ca_id: string;
  rule_name: string;
  compliance_type: string;
  trigger_condition: Record<string, any>;
  action_type: string;
  is_active: boolean;
}

export class ComplianceService {
  private static instance: ComplianceService;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Get compliance deadlines for a user
   */
  async getDeadlines(userId: string, filters?: {
    status?: string;
    deadline_type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ComplianceDeadline[]> {
    let query = this.supabase
      .from('compliance_deadlines')
      .select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.deadline_type) {
      query = query.eq('deadline_type', filters.deadline_type);
    }

    if (filters?.startDate) {
      query = query.gte('due_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('due_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance deadlines:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get pending deadlines (due within 30 days)
   */
  async getPendingDeadlines(userId: string): Promise<ComplianceDeadline[]> {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .select('*')
      .eq('status', 'pending')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', thirtyDaysLater.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(userId: string): Promise<ComplianceDeadline[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', today);

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a compliance deadline
   */
  async createDeadline(deadline: Omit<ComplianceDeadline, 'id'>): Promise<ComplianceDeadline> {
    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .insert([deadline])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update deadline status
   */
  async updateDeadlineStatus(
    deadlineId: string,
    status: string,
    completedAt?: string
  ): Promise<ComplianceDeadline> {
    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .update({
        status,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get compliance calendar for a year
   */
  async getComplianceCalendar(financialYear: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('compliance_calendar')
      .select('*')
      .eq('financial_year', financialYear)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Set up automation rules for compliance tracking
   */
  async createAutomationRule(rule: Omit<ComplianceAutomationRule, 'id'>): Promise<ComplianceAutomationRule> {
    const { data, error } = await this.supabase
      .from('compliance_automation_rules')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get automation rules for a CA
   */
  async getAutomationRules(caId: string): Promise<ComplianceAutomationRule[]> {
    const { data, error } = await this.supabase
      .from('compliance_automation_rules')
      .select('*')
      .eq('ca_id', caId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate days until deadline
   */
  daysUntilDeadline(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if deadline is overdue
   */
  isOverdue(dueDate: string): boolean {
    return this.daysUntilDeadline(dueDate) < 0;
  }

  /**
   * Get compliance status for dashboard
   */
  async getComplianceStatus(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    completionRate: number;
  }> {
    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .select('status', { count: 'exact' });

    if (error) throw error;

    const total = data?.length || 0;
    const pending = data?.filter((d: any) => d.status === 'pending').length || 0;
    const completed = data?.filter((d: any) => d.status === 'completed').length || 0;
    const overdue = data?.filter((d: any) => d.status === 'overdue').length || 0;

    return {
      total,
      pending,
      completed,
      overdue,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  /**
   * Send compliance deadline reminders
   */
  async sendReminders(): Promise<void> {
    const pendingDeadlines = await this.getPendingDeadlines('');
    
    for (const deadline of pendingDeadlines) {
      const daysRemaining = this.daysUntilDeadline(deadline.due_date);
      
      if (deadline.reminder_days?.includes(daysRemaining)) {
        // Send notification here
        console.log(`Reminder: ${deadline.title} due in ${daysRemaining} days`);
      }
    }
  }

  /**
   * Get compliance summary for a client
   */
  async getClientComplianceSummary(clientId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('compliance_deadlines')
      .select('deadline_type, status')
      .eq('client_id', clientId);

    if (error) throw error;

    const summary = data?.reduce((acc: Record<string, any>, item: any) => {
      if (!acc[item.deadline_type]) {
        acc[item.deadline_type] = { pending: 0, completed: 0, overdue: 0 };
      }
      acc[item.deadline_type][item.status]++;
      return acc;
    }, {});

    return summary;
  }
}

export default ComplianceService.getInstance();
