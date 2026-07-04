import { createClient } from '@/utils/supabase/server';

export const clientService = {
  // Create client
  async createClient(caId: string, data: {
    fullName: string;
    displayName?: string;
    email: string;
    phone?: string;
    alternatePhone?: string;
    clientType: 'individual' | 'company' | 'huf' | 'trust' | 'partnership' | 'llp';
    pan?: string;
    aadhaar?: string;
    gstin?: string;
    tan?: string;
    cin?: string;
    dateOfBirth?: string;
    dateOfIncorporation?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    status?: 'active' | 'inactive' | 'prospect' | 'archived';
    source?: 'referral' | 'walk_in' | 'online' | 'other';
    riskLevel?: 'low' | 'medium' | 'high';
    notes?: string;
    tags?: string[];
    portalAccess?: boolean;
  }) {
    const supabase = await createClient();

    // 1. Get CA's organization_id
    const { data: caProfile, error: caProfileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', caId)
      .single();

    if (caProfileError || !caProfile?.organization_id) {
      throw new Error(`CA organization not found: ${caProfileError?.message || 'Empty ID'}`);
    }

    const orgId = caProfile.organization_id;

    // 2. Create profile in auth if portal access requested
    let portalUserId = null;
    if (data.portalAccess && data.email) {
      const { data: userAuth, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: 'password123', // temporary default password
        email_confirm: true,
        user_metadata: {
          role: 'client',
          name: data.fullName,
          organization_id: orgId
        }
      });
      if (!authError && userAuth?.user) {
        portalUserId = userAuth.user.id;
      } else if (authError) {
        console.error('Portal user creation error (continuing without portal access):', authError.message);
      }
    }

    // 3. Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        organization_id: orgId,
        assigned_ca_id: caId,
        client_type: data.clientType,
        full_name: data.fullName,
        display_name: data.displayName || data.fullName,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone,
        pan: data.pan,
        aadhaar: data.aadhaar,
        gstin: data.gstin,
        tan: data.tan,
        cin: data.cin,
        date_of_birth: data.dateOfBirth ? data.dateOfBirth : null,
        date_of_incorporation: data.dateOfIncorporation ? data.dateOfIncorporation : null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || 'India',
        status: data.status || 'active',
        source: data.source || 'other',
        risk_level: data.riskLevel || 'low',
        notes: data.notes,
        tags: data.tags || [],
        portal_access: !!portalUserId,
        portal_user_id: portalUserId
      })
      .select()
      .single();

    if (clientError) throw clientError;
    return client;
  },

  // Get all clients for CA
  async getClientsByCA(caId: string, filters?: {
    search?: string;
    type?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const supabase = await createClient();

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('assigned_ca_id', caId);

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('client_type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,pan.ilike.%${filters.search}%,gstin.ilike.%${filters.search}%`
      );
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { clients: data || [], total: count || 0 };
  },

  // Get client by ID
  async getClientById(clientId: string) {
    const supabase = await createClient();

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) throw error;

    // Fetch related records in parallel using client ID
    const [documents, tasks, invoices, appointments, compliance, notes] = await Promise.all([
      supabase.from('documents').select('*').eq('client_id', clientId),
      supabase.from('tasks').select('*').eq('client_id', clientId),
      supabase.from('invoices').select('*').eq('client_id', clientId),
      supabase.from('appointments').select('*').eq('client_id', clientId),
      supabase.from('compliance_records').select('*').eq('client_id', clientId),
      supabase.from('client_notes').select('*').eq('client_id', clientId),
    ]);

    return {
      ...client,
      documents: documents.data || [],
      tasks: tasks.data || [],
      invoices: invoices.data || [],
      appointments: appointments.data || [],
      complianceRecords: compliance.data || [],
      notes: notes.data || [],
    };
  },

  // Update client
  async updateClient(clientId: string, data: Partial<any>) {
    const supabase = await createClient();

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update({
        full_name: data.fullName || data.full_name,
        display_name: data.displayName || data.display_name,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone || data.alternate_phone,
        pan: data.pan,
        aadhaar: data.aadhaar,
        gstin: data.gstin,
        tan: data.tan,
        cin: data.cin,
        date_of_birth: data.dateOfBirth || data.date_of_birth,
        date_of_incorporation: data.dateOfIncorporation || data.date_of_incorporation,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        status: data.status,
        source: data.source,
        risk_level: data.riskLevel || data.risk_level,
        notes: data.notes,
        tags: data.tags,
        portal_access: data.portalAccess || data.portal_access
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return updatedClient;
  },

  // Delete client
  async deleteClient(clientId: string) {
    const supabase = await createClient();
    const { data: client } = await supabase.from('clients').select('portal_user_id').eq('id', clientId).single();
    
    // 1. Delete client record (cascades)
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;

    // 2. Delete auth portal user if linked
    if (client?.portal_user_id) {
      await supabase.auth.admin.deleteUser(client.portal_user_id);
    }

    return { success: true };
  },

  // Get client timeline/activity
  async getClientTimeline(clientId: string, limit: number = 50) {
    const supabase = await createClient();

    const [tasks, documents, invoices, appointments, notes] = await Promise.all([
      supabase.from('tasks').select('*').eq('client_id', clientId).order('updated_at', { ascending: false }).limit(limit),
      supabase.from('documents').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(limit),
      supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(limit),
      supabase.from('appointments').select('*').eq('client_id', clientId).order('start_time', { ascending: false }).limit(limit),
      supabase.from('client_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(limit),
    ]);

    return {
      tasks: tasks.data || [],
      documents: documents.data || [],
      invoices: invoices.data || [],
      appointments: appointments.data || [],
      notes: notes.data || [],
    };
  },

  // Add tag to client
  async addTagToClient(clientId: string, tagName: string) {
    const supabase = await createClient();
    const { data: client } = await supabase.from('clients').select('tags').eq('id', clientId).single();
    if (!client) throw new Error('Client not found');

    const tags = Array.isArray(client.tags) ? client.tags : [];
    if (!tags.includes(tagName)) {
      tags.push(tagName);
      await supabase.from('clients').update({ tags }).eq('id', clientId);
    }
  },

  // Get clients by tag
  async getClientsByTag(caId: string, tagName: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('assigned_ca_id', caId)
      .contains('tags', [tagName]);

    if (error) throw error;
    return data || [];
  },
};
