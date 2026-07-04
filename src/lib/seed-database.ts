// src/lib/seed-database.ts
// Comprehensive database seeding using Supabase Service Role client

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !serviceKey) {
  console.error('⚠️ Supabase credentials missing from environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    const testUsers = [
      { email: 'ca@taxmate.com', name: 'Rajesh Kumar', role: 'ca', orgName: 'Kumar & Associates' },
      { email: 'staff@taxmate.com', name: 'Priya Sharma', role: 'staff' },
      { email: 'client@taxmate.com', name: 'ABC Enterprises', role: 'client' }
    ];

    console.log('🧹 Cleaning up existing test users...');
    for (const u of testUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', u.email)
        .maybeSingle();

      if (existing) {
        // Delete from auth.users (cascades to profiles)
        await supabase.auth.admin.deleteUser(existing.id);
        console.log(`Deleted existing user: ${u.email}`);
      }
    }

    console.log('👤 Creating CA User Rajesh Kumar...');
    const { data: caAuth, error: caErr } = await supabase.auth.admin.createUser({
      email: 'ca@taxmate.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'ca',
        name: 'Rajesh Kumar',
        organization_name: 'Kumar & Associates'
      }
    });

    if (caErr) throw caErr;
    const caId = caAuth.user.id;
    console.log(`Created CA Auth user: ${caId}`);

    // Wait a brief moment for the database trigger to complete profile creation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get the generated organization ID for Rajesh Kumar
    const { data: caProfile, error: profErr } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', caId)
      .single();

    if (profErr || !caProfile.organization_id) {
      throw new Error(`Failed to retrieve organization ID: ${profErr?.message}`);
    }
    const orgId = caProfile.organization_id;
    console.log(`Retrieved Organization ID: ${orgId}`);

    console.log('👤 Creating Staff User Priya Sharma...');
    const { data: staffAuth, error: staffErr } = await supabase.auth.admin.createUser({
      email: 'staff@taxmate.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'staff',
        name: 'Priya Sharma',
        organization_id: orgId
      }
    });

    if (staffErr) throw staffErr;
    const staffId = staffAuth.user.id;
    console.log(`Created Staff Auth user: ${staffId}`);

    console.log('👤 Creating Client User ABC Enterprises...');
    const { data: clientAuth, error: clientErr } = await supabase.auth.admin.createUser({
      email: 'client@taxmate.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'client',
        name: 'ABC Enterprises',
        organization_id: orgId
      }
    });

    if (clientErr) throw clientErr;
    const clientUserId = clientAuth.user.id;
    console.log(`Created Client Auth user: ${clientUserId}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('🏢 Creating Client Profile in clients table...');
    const { data: clientRow, error: clientRowErr } = await supabase
      .from('clients')
      .insert({
        organization_id: orgId,
        assigned_ca_id: caId,
        client_type: 'company',
        full_name: 'ABC Enterprises Pvt Ltd',
        display_name: 'ABC Enterprises',
        email: 'client@taxmate.com',
        phone: '+91-9876543211',
        pan: 'AAACA1234A',
        aadhaar: '123456789012',
        gstin: '27AAACA1234A1Z5',
        address: '101, Business Park, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        status: 'active',
        source: 'referral',
        risk_level: 'low',
        portal_access: true,
        portal_user_id: clientUserId,
        kyc_verified: true,
        kyc_verified_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (clientRowErr) throw clientRowErr;
    const clientId = clientRow.id;
    console.log(`Created Client record: ${clientId}`);

    console.log('🏷️ Seeding Tags...');
    const { data: tagRows } = await supabase
      .from('tags')
      .insert([
        { organization_id: orgId, name: 'VIP', color: '#65a30d', type: 'client' },
        { organization_id: orgId, name: 'Urgent', color: '#ef4444', type: 'task' },
        { organization_id: orgId, name: 'Tax Return', color: '#3b82f6', type: 'document' }
      ])
      .select();

    console.log('📋 Seeding Master Compliance Deadlines...');
    await supabase.from('compliance_deadlines').insert([
      { compliance_type: 'gst_r1', period_type: 'monthly', day_of_month: 11, description: 'GST GSTR-1 Return Filing', is_active: true },
      { compliance_type: 'gst_r3b', period_type: 'monthly', day_of_month: 20, description: 'GST GSTR-3B Return Filing', is_active: true },
      { compliance_type: 'itr_1', period_type: 'annual', day_of_month: 31, month_of_year: 7, description: 'Individual Income Tax Return Filing', is_active: true },
      { compliance_type: 'tds_26q', period_type: 'quarterly', day_of_month: 31, month_of_year: 7, description: 'Quarterly TDS Statement - Salaries', is_active: true }
    ]);

    console.log('📅 Seeding Compliance Records...');
    const { data: compRows } = await supabase
      .from('compliance_records')
      .insert([
        {
          organization_id: orgId,
          client_id: clientId,
          compliance_type: 'gst_r1',
          financial_year: '2025-26',
          assessment_year: '2026-27',
          period_start: '2026-05-01',
          period_end: '2026-05-31',
          due_date: '2026-06-11',
          status: 'pending'
        },
        {
          organization_id: orgId,
          client_id: clientId,
          compliance_type: 'itr_1',
          financial_year: '2025-26',
          assessment_year: '2026-27',
          period_start: '2025-04-01',
          period_end: '2026-03-31',
          due_date: '2026-07-31',
          status: 'in_progress'
        }
      ])
      .select();

    console.log('📝 Seeding Tasks...');
    const { data: taskRows } = await supabase
      .from('tasks')
      .insert([
        {
          organization_id: orgId,
          client_id: clientId,
          created_by: caId,
          assigned_to: staffId,
          title: 'Prepare GST returns for ABC Enterprises',
          description: 'Review sale registers, compute tax liability, and prepare GSTR-1 file draft.',
          task_type: 'gst_filing',
          priority: 'high',
          status: 'in_progress',
          due_date: '2026-06-10',
          financial_year: '2025-26',
          billable: true,
          tags: ['Urgent']
        },
        {
          organization_id: orgId,
          client_id: clientId,
          created_by: caId,
          assigned_to: caId,
          title: 'Review ITR documentation',
          description: 'Gather Form 26AS, AIS, and capital gains reports.',
          task_type: 'itr_filing',
          priority: 'medium',
          status: 'not_started',
          due_date: '2026-07-20',
          financial_year: '2025-26',
          billable: false
        }
      ])
      .select();

    const gstTaskId = taskRows?.[0]?.id;

    if (gstTaskId) {
      console.log('💬 Seeding Task Comments...');
      await supabase.from('task_comments').insert([
        {
          task_id: gstTaskId,
          author_id: staffId,
          content: 'I have started compiling the purchase invoices. Awaiting client bank statement.',
          is_internal: true
        }
      ]);
    }

    console.log('📄 Seeding Documents...');
    await supabase.from('documents').insert([
      {
        organization_id: orgId,
        client_id: clientId,
        uploaded_by: caId,
        file_name: 'PAN_Card_ABC_Enterprises.pdf',
        file_path: 'uploads/pan_card.pdf',
        file_size: 1048576,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        category: 'identity',
        financial_year: '2025-26',
        description: 'PAN card upload for KYC verification',
        is_shared_with_client: true
      },
      {
        organization_id: orgId,
        client_id: clientId,
        uploaded_by: clientUserId,
        file_name: 'Bank_Statement_May_2026.xlsx',
        file_path: 'uploads/bank_statement_may_2026.xlsx',
        file_size: 2048576,
        file_type: 'xlsx',
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        category: 'financial',
        financial_year: '2025-26',
        description: 'May 2026 bank transactions log'
      }
    ]);

    console.log('💵 Seeding Invoices & Line Items...');
    const { data: invRows } = await supabase
      .from('invoices')
      .insert({
        organization_id: orgId,
        client_id: clientId,
        created_by: caId,
        invoice_date: '2026-06-01',
        due_date: '2026-06-15',
        status: 'sent',
        subtotal: 10000.00,
        tax_percentage: 18.00,
        tax_amount: 1800.00,
        total_amount: 11800.00,
        balance_due: 11800.00,
        payment_terms: 'net_15',
        notes: 'Thank you for your business!'
      })
      .select();

    const invId = invRows?.[0]?.id;

    if (invId) {
      await supabase.from('invoice_line_items').insert({
        invoice_id: invId,
        description: 'Consultation & GST filing service charges - Q1',
        quantity: 1,
        unit_price: 10000.00,
        amount: 10000.00,
        sort_order: 1
      });
    }

    console.log('📅 Seeding Appointments...');
    await supabase.from('appointments').insert({
      organization_id: orgId,
      client_id: clientId,
      ca_id: caId,
      created_by: caId,
      title: 'Tax Consultation & GST Review',
      description: 'Consultation on current filings and GST liability validation.',
      appointment_type: 'video_call',
      status: 'confirmed',
      start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 90000000).toISOString(),
      duration_minutes: 60,
      location: 'video',
      livekit_room_name: 'consultation-abc'
    });

    console.log('💬 Seeding Messages & Realtime Conversations...');
    const { data: convRows } = await supabase
      .from('conversations')
      .insert({
        organization_id: orgId,
        type: 'client',
        title: 'ABC Enterprises Chat',
        client_id: clientId
      })
      .select();

    const convId = convRows?.[0]?.id;

    if (convId) {
      // Add participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: convId, user_id: caId, role: 'admin' },
        { conversation_id: convId, user_id: clientUserId, role: 'member' }
      ]);

      // Add messages
      await supabase.from('messages').insert([
        { conversation_id: convId, sender_id: caId, content: 'Hello ABC team, please upload your May bank statement.' },
        { conversation_id: convId, sender_id: clientUserId, content: 'Hi Rajesh, I have uploaded the statement in the portal documents section.' }
      ]);
    }

    console.log('🎉 Database seeding completed!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
