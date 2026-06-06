import { createClient } from '@/utils/supabase/server';

export const clientService = {
  // Create client
  async createClient(caId: string, data: {
    name: string;
    email?: string;
    phone?: string;
    type: 'INDIVIDUAL' | 'BUSINESS';
    businessName?: string;
    panNumber?: string;
    gstNumber?: string;
    annualIncome?: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    tags?: string[];
  }) {
    const supabase = await createClient();

    // 1. Create user in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: data.name,
        email: data.email || `client_${Date.now()}@taxmate.com`,
        phone: data.phone,
        role: 'CLIENT',
        status: 'ACTIVE',
        onboarding_completed: false,
      })
      .select()
      .single();

    if (userError) throw userError;

    // 2. Create client profile
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        user_id: user.id,
        ca_id: caId,
        pan_number: data.panNumber,
        gstin: data.gstNumber,
        business_name: data.businessName,
        business_type: data.type,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        bank_account_number: undefined, // Default empty
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return {
      ...user,
      ...profile,
      id: profile.id, // Ensure id matches client_profile id
    };
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
      .from('client_profiles')
      .select(`
        *,
        user:users!client_profiles_user_id_fkey (
          id,
          name,
          email,
          phone,
          status
        )
      `, { count: 'exact' })
      .eq('ca_id', caId);

    if (filters?.type) {
      query = query.eq('business_type', filters.type);
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter by search term on client-side or add in query if needed
    let clients = (data || []).map((profile: any) => ({
      ...profile,
      name: profile.user?.name || '',
      email: profile.user?.email || '',
      phone: profile.user?.phone || '',
      status: profile.user?.status?.toLowerCase() || 'active',
      gst_number: profile.gstin || '',
      pan_number: profile.pan_number || '',
    }));

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      clients = clients.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.gst_number.toLowerCase().includes(search) ||
        c.pan_number.toLowerCase().includes(search)
      );
    }

    return { clients, total: count || clients.length };
  },

  // Get client by ID
  async getClientById(clientId: string) {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('client_profiles')
      .select(`
        *,
        user:users!client_profiles_user_id_fkey (
          id,
          name,
          email,
          phone,
          status
        )
      `)
      .eq('id', clientId)
      .single();

    if (error) throw error;

    // Fetch related items in parallel
    const [documents, tasks, invoices, appointments, taxFilings, notes] = await Promise.all([
      supabase.from('documents').select('*').eq('client_id', profile.user_id),
      supabase.from('tasks').select('*').eq('client_id', profile.user_id),
      supabase.from('invoices').select('*').eq('client_id', profile.user_id),
      supabase.from('appointments').select('*').eq('client_id', profile.user_id),
      supabase.from('tax_filings').select('*').eq('client_id', profile.user_id),
      supabase.from('notes').select('*').eq('user_id', profile.user_id),
    ]);

    return {
      ...profile,
      name: profile.user?.name || '',
      email: profile.user?.email || '',
      phone: profile.user?.phone || '',
      status: profile.user?.status || 'ACTIVE',
      documents: documents.data || [],
      tasks: tasks.data || [],
      invoices: invoices.data || [],
      appointments: appointments.data || [],
      taxFilings: taxFilings.data || [],
      notes: notes.data || [],
    };
  },

  // Update client
  async updateClient(clientId: string, data: any) {
    const supabase = await createClient();

    // Fetch original profile first to get user_id
    const { data: original } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (!original) throw new Error('Client not found');

    // Update users table if name/email/phone provided
    if (data.name || data.email || data.phone || data.status) {
      await supabase
        .from('users')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status ? data.status.toUpperCase() : undefined,
        })
        .eq('id', original.user_id);
    }

    // Update client profile table
    const { data: profile, error } = await supabase
      .from('client_profiles')
      .update({
        pan_number: data.panNumber || data.pan_number,
        gstin: data.gstNumber || data.gst_number || data.gstin,
        business_name: data.businessName || data.business_name,
        business_type: data.type || data.business_type,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  // Delete client
  async deleteClient(clientId: string) {
    const supabase = await createClient();

    // Get original profile to get user_id
    const { data: original } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (original) {
      // Cascade delete starting from users
      await supabase.from('users').delete().eq('id', original.user_id);
    }

    return { success: true };
  },

  // Get client timeline/activity
  async getClientTimeline(clientId: string, limit: number = 50) {
    const supabase = await createClient();

    // Get client profile to get user_id
    const { data: original } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (!original) throw new Error('Client not found');

    const [tasks, documents, invoices, appointments, notes] = await Promise.all([
      supabase.from('tasks').select('*').eq('client_id', original.user_id).order('updated_at', { ascending: false }).limit(limit),
      supabase.from('documents').select('*').eq('client_id', original.user_id).order('created_at', { ascending: false }).limit(limit),
      supabase.from('invoices').select('*').eq('client_id', original.user_id).order('created_at', { ascending: false }).limit(limit),
      supabase.from('appointments').select('*').eq('client_id', original.user_id).order('start_time', { ascending: false }).limit(limit),
      supabase.from('notes').select('*').eq('user_id', original.user_id).order('created_at', { ascending: false }).limit(limit),
    ]);

    return {
      tasks: tasks.data || [],
      documents: documents.data || [],
      invoices: invoices.data || [],
      appointments: appointments.data || [],
      notes: notes.data || [],
    };
  },

  // Add tags to client
  async addTagToClient(clientId: string, tag: string) {
    const supabase = await createClient();
    const { data: client } = await supabase.from('client_profiles').select('metadata').eq('id', clientId).single();
    if (!client) throw new Error('Client not found');

    const tags = Array.isArray(client.metadata?.tags) ? client.metadata.tags : [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      await supabase.from('client_profiles').update({
        metadata: { ...client.metadata, tags }
      }).eq('id', clientId);
    }
  },

  // Get clients by tag
  async getClientsByTag(caId: string, tag: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('ca_id', caId);

    if (error) throw error;
    return (data || []).filter(c => Array.isArray(c.metadata?.tags) && c.metadata.tags.includes(tag));
  },
};
