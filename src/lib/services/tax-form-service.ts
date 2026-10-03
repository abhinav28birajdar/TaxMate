/**
 * Tax Form Service
 * Manages tax form templates, client forms, and form completion tracking
 */

import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TaxFormTemplate {
  id: string;
  formCode: string;
  formName: string;
  description: string;
  country: string;
  category: string;
  requiredDocuments: string[];
  fieldMappings: Record<string, any>;
  isActive: boolean;
}

export interface ClientTaxForm {
  id: string;
  client_id: string;
  template_id: string;
  formCode: string;
  formName: string;
  financial_year: string;
  form_data: Record<string, any>;
  status: 'draft' | 'in_progress' | 'review' | 'submitted';
  completion_percentage: number;
  missing_fields: string[];
  submittedAt?: string;
}

export class TaxFormService {
  private static instance: TaxFormService;
  private client: SupabaseClient | null;

  constructor(supabase?: SupabaseClient) {
    this.client = supabase ?? null;
  }

  private getSupabase(): SupabaseClient {
    if (!this.client) {
      this.client = createClient();
    }

    return this.client;
  }

  private get supabase(): SupabaseClient {
    return this.getSupabase();
  }

  static getInstance(): TaxFormService {
    if (!TaxFormService.instance) {
      TaxFormService.instance = new TaxFormService();
    }
    return TaxFormService.instance;
  }

  /**
   * Get available tax form templates
   */
  async getFormTemplates(country: string = 'IN', category?: string): Promise<TaxFormTemplate[]> {
    let query = this.supabase
      .from('tax_form_templates')
      .select('*')
      .eq('country', country)
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific form template
   */
  async getFormTemplate(templateId: string): Promise<TaxFormTemplate> {
    const { data, error } = await this.supabase
      .from('tax_form_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get form template by code
   */
  async getFormTemplateByCode(formCode: string): Promise<TaxFormTemplate> {
    const { data, error } = await this.supabase
      .from('tax_form_templates')
      .select('*')
      .eq('form_code', formCode)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new tax form for a client
   */
  async createClientTaxForm(
    clientId: string,
    templateId: string,
    caseId: string,
    financialYear: string
  ): Promise<ClientTaxForm> {
    const template = await this.getFormTemplate(templateId);

    const { data, error } = await this.supabase
      .from('client_tax_forms')
      .insert([
        {
          client_id: clientId,
          template_id: templateId,
          case_id: caseId,
          form_code: template.formCode,
          form_name: template.formName,
          financial_year: financialYear,
          form_data: {},
          status: 'draft',
          completion_percentage: 0,
          missing_fields: Object.keys(template.fieldMappings || {}),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get client's tax forms
   */
  async getClientTaxForms(clientId: string, financialYear?: string): Promise<ClientTaxForm[]> {
    let query = this.supabase
      .from('client_tax_forms')
      .select('*')
      .eq('client_id', clientId);

    if (financialYear) {
      query = query.eq('financial_year', financialYear);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific client tax form
   */
  async getClientTaxForm(formId: string): Promise<ClientTaxForm> {
    const { data, error } = await this.supabase
      .from('client_tax_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update tax form data
   */
  async updateTaxFormData(
    formId: string,
    formData: Record<string, any>
  ): Promise<ClientTaxForm> {
    const form = await this.getClientTaxForm(formId);
    const template = await this.getFormTemplate(form.template_id);

    // Calculate completion percentage
    const requiredFields = Object.keys(template.fieldMappings || {});
    const filledFields = requiredFields.filter(field => formData[field] !== undefined && formData[field] !== null);
    const completionPercentage = (filledFields.length / requiredFields.length) * 100;
    const missingFields = requiredFields.filter(field => !filledFields.includes(field));

    const { data, error } = await this.supabase
      .from('client_tax_forms')
      .update({
        form_data: formData,
        completion_percentage: completionPercentage,
        missing_fields: missingFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Move form to next status
   */
  async updateFormStatus(
    formId: string,
    newStatus: 'draft' | 'in_progress' | 'review' | 'submitted'
  ): Promise<ClientTaxForm> {
    const { data, error } = await this.supabase
      .from('client_tax_forms')
      .update({
        status: newStatus,
        submitted_at: newStatus === 'submitted' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get forms requiring action
   */
  async getFormsNeedingAction(clientId: string): Promise<ClientTaxForm[]> {
    const { data, error } = await this.supabase
      .from('client_tax_forms')
      .select('*')
      .eq('client_id', clientId)
      .in('status', ['draft', 'in_progress'])
      .order('updated_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Pre-fill form data from client profile
   */
  async prefillFormData(formId: string, clientId: string): Promise<ClientTaxForm> {
    const { data: clientProfile } = await this.supabase
      .from('client_profiles')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!clientProfile) throw new Error('Client profile not found');

    const { data: user } = await this.supabase
      .from('users')
      .select('email, phone')
      .eq('id', clientProfile.user_id)
      .single();

    const prefillData = {
      pan: clientProfile.pan_number,
      gstin: clientProfile.gstin,
      firstName: clientProfile.first_name,
      lastName: clientProfile.last_name,
      email: user?.email,
      phone: user?.phone,
      dob: clientProfile.date_of_birth,
    };

    return this.updateTaxFormData(formId, prefillData);
  }

  /**
   * Get form requirements/checklist
   */
  async getFormRequirements(templateId: string): Promise<string[]> {
    const template = await this.getFormTemplate(templateId);
    return template.requiredDocuments || [];
  }

  /**
   * Check if all required documents are uploaded for a form
   */
  async checkFormDocumentsStatus(formId: string): Promise<{
    required: string[];
    uploaded: string[];
    pending: string[];
  }> {
    const form = await this.getClientTaxForm(formId);
    const template = await this.getFormTemplate(form.template_id);

    const { data: documents } = await this.supabase
      .from('documents')
      .select('category')
      .eq('case_id', formId);

    const uploadedCategories = documents?.map(d => d.category) || [];
    const requiredCategories = template.requiredDocuments || [];
    const pendingCategories = requiredCategories.filter(cat => !uploadedCategories.includes(cat));

    return {
      required: requiredCategories,
      uploaded: uploadedCategories,
      pending: pendingCategories,
    };
  }

  /**
   * Submit tax form
   */
  async submitTaxForm(formId: string): Promise<ClientTaxForm> {
    const form = await this.getClientTaxForm(formId);

    if (form.completion_percentage < 100) {
      throw new Error('Form is not 100% complete. Missing fields: ' + form.missing_fields.join(', '));
    }

    const docStatus = await this.checkFormDocumentsStatus(formId);
    if (docStatus.pending.length > 0) {
      throw new Error('Required documents are pending: ' + docStatus.pending.join(', '));
    }

    return this.updateFormStatus(formId, 'submitted');
  }

  /**
   * Get submitted forms
   */
  async getSubmittedForms(clientId: string, financialYear?: string): Promise<ClientTaxForm[]> {
    let query = this.supabase
      .from('client_tax_forms')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'submitted');

    if (financialYear) {
      query = query.eq('financial_year', financialYear);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get form templates for a financial year
   */
  async getFormTemplatesForYear(financialYear: string): Promise<TaxFormTemplate[]> {
    const [yearStart, yearEnd] = financialYear.split('-').map(Number);

    const { data, error } = await this.supabase
      .from('tax_form_templates')
      .select('*')
      .eq('is_active', true)
      .lte('financial_year_from', yearStart)
      .gte('financial_year_to', yearEnd);

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate form completion summary for a client
   */
  async getCompletionSummary(clientId: string, financialYear: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
  }> {
    const forms = await this.getClientTaxForms(clientId, financialYear);

    const total = forms.length;
    const completed = forms.filter(f => f.status === 'submitted').length;
    const inProgress = forms.filter(f => f.status === 'in_progress').length;
    const pending = forms.filter(f => f.status === 'draft').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate,
    };
  }
}

export default TaxFormService.getInstance();
