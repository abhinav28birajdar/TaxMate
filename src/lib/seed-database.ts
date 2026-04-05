// lib/seed-database.ts
// Comprehensive database seeding with realistic Taxmate data

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed users (CAs and Clients)
    await seedUsers();
    console.log('✅ Users seeded');

    // Seed CA profiles
    await seedCAProfiles();
    console.log('✅ CA profiles seeded');

    // Seed clients
    await seedClients();
    console.log('✅ Clients seeded');

    // Seed services
    await seedServices();
    console.log('✅ Services seeded');

    // Seed documents
    await seedDocuments();
    console.log('✅ Documents seeded');

    // Seed invoices and payments
    await seedInvoices();
    console.log('✅ Invoices seeded');

    // Seed tasks
    await seedTasks();
    console.log('✅ Tasks seeded');

    // Seed compliance data
    await seedCompliance();
    console.log('✅ Compliance data seeded');

    // Seed GST & ITR data
    await seedGSTITR();
    console.log('✅ GST & ITR data seeded');

    // Seed workflow automations
    await seedWorkflows();
    console.log('✅ Workflows seeded');

    console.log('🎉 Database seeding completed!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

async function seedUsers() {
  // CA User
  const caUser = {
    id: 'ca-user-001',
    email: 'ca@taxmate.com',
    role: 'CA',
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    verified: true,
  };

  // Client Users
  const clientUsers = [
    { id: 'client-001', email: 'abc@business.com', role: 'CLIENT', name: 'ABC Enterprises', phone: '+91-8765432109' },
    { id: 'client-002', email: 'xyz@retail.com', role: 'CLIENT', name: 'XYZ Retail Store', phone: '+91-7654321098' },
    { id: 'client-003', email: 'tech@startup.com', role: 'CLIENT', name: 'Tech Startup India', phone: '+91-6543210987' },
  ];

  // Staff User
  const staffUser = {
    id: 'staff-001',
    email: 'priya@taxmate.com',
    role: 'STAFF',
    name: 'Priya Sharma',
    phone: '+91-9123456789',
  };

  // Insert users
  await supabase.from('users').insert([caUser, ...clientUsers, staffUser]);
}

async function seedCAProfiles() {
  const caProfile = {
    id: 'ca-user-001',
    firm_name: 'Kumar & Associates',
    gst_number: '27ABC1234D12Z5',
    experience: 12,
    kyc_verified: true,
    specialization: ['GST Compliance', 'ITR Filing', 'Business Audit'],
    rating: 4.8,
    reviews: 45,
  };

  await supabase.from('ca_profiles').insert([caProfile]);
}

async function seedClients() {
  const clients = [
    {
      ca_id: 'ca-user-001',
      name: 'ABC Enterprises',
      type: 'BUSINESS',
      gst: '27ABC1234D12Z5',
      pan: 'ABCD1234E',
      email: 'abc@business.com',
      phone: '+91-8765432109',
      status: 'ACTIVE',
    },
    {
      ca_id: 'ca-user-001',
      name: 'XYZ Retail Store',
      type: 'BUSINESS',
      gst: '27XYZ5678F90Z1',
      pan: 'XYZF1234E',
      email: 'xyz@retail.com',
      phone: '+91-7654321098',
      status: 'ACTIVE',
    },
    {
      ca_id: 'ca-user-001',
      name: 'Tech Startup India',
      type: 'STARTUP',
      gst: '27TECH1122G45Z3',
      pan: 'TECH1234E',
      email: 'tech@startup.com',
      phone: '+91-6543210987',
      status: 'ACTIVE',
    },
  ];

  await supabase.from('clients').insert(clients);
}

async function seedServices() {
  const services = [
    {
      ca_id: 'ca-user-001',
      name: 'GST Filing',
      description: 'Monthly GST return filing and compliance',
      price: 5000,
      category: 'GST_COMPLIANCE',
      duration_days: 5,
    },
    {
      ca_id: 'ca-user-001',
      name: 'ITR Filing',
      description: 'Annual income tax return filing',
      price: 7500,
      category: 'ITR_FILING',
      duration_days: 15,
    },
    {
      ca_id: 'ca-user-001',
      name: 'Annual Audit',
      description: 'Complete financial audit and compliance',
      price: 25000,
      category: 'AUDIT',
      duration_days: 30,
    },
    {
      ca_id: 'ca-user-001',
      name: 'GST Reconciliation',
      description: 'GST reconciliation and correction',
      price: 3500,
      category: 'GST_COMPLIANCE',
      duration_days: 7,
    },
    {
      ca_id: 'ca-user-001',
      name: 'Accounting Support',
      description: 'Monthly accounting and bookkeeping',
      price: 8000,
      category: 'ACCOUNTING',
      duration_days: 5,
    },
  ];

  await supabase.from('services').insert(services);
}

async function seedDocuments() {
  const documents = [
    {
      client_id: 'client-001',
      ca_id: 'ca-user-001',
      file_name: 'GST_Preparation_March2024.pdf',
      category: 'GST',
      file_size: 2048000,
      upload_date: '2024-03-31',
      version: 1,
      status: 'VERIFIED',
    },
    {
      client_id: 'client-001',
      ca_id: 'ca-user-001',
      file_name: 'Bank_Statement_March2024.pdf',
      category: 'BANK_STATEMENTS',
      file_size: 1536000,
      upload_date: '2024-03-28',
      version: 1,
      status: 'VERIFIED',
    },
    {
      client_id: 'client-002',
      ca_id: 'ca-user-001',
      file_name: 'ITR_Supporting_Docs.pdf',
      category: 'ITR',
      file_size: 3072000,
      upload_date: '2024-03-25',
      version: 1,
      status: 'VERIFIED',
    },
  ];

  await supabase.from('documents').insert(documents);
}

async function seedInvoices() {
  const invoices = [
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      invoice_number: 'INV-2024-001',
      amount: 50000,
      gst_amount: 9000,
      total_amount: 59000,
      status: 'PAID',
      issue_date: '2024-03-01',
      due_date: '2024-03-15',
      payment_date: '2024-03-12',
    },
    {
      ca_id: 'ca-user-001',
      client_id: 'client-002',
      invoice_number: 'INV-2024-002',
      amount: 75000,
      gst_amount: 13500,
      total_amount: 88500,
      status: 'PAID',
      issue_date: '2024-03-05',
      due_date: '2024-03-20',
      payment_date: '2024-03-19',
    },
    {
      ca_id: 'ca-user-001',
      client_id: 'client-003',
      invoice_number: 'INV-2024-003',
      amount: 60000,
      gst_amount: 10800,
      total_amount: 70800,
      status: 'PENDING',
      issue_date: '2024-04-01',
      due_date: '2024-04-15',
      payment_date: null,
    },
  ];

  await supabase.from('invoices').insert(invoices);
}

async function seedTasks() {
  const tasks = [
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      title: 'Prepare GST Filing',
      description: 'Prepare and file monthly GST return',
      status: 'COMPLETED',
      priority: 'HIGH',
      due_date: '2024-03-31',
      assigned_to: 'staff-001',
    },
    {
      ca_id: 'ca-user-001',
      client_id: 'client-002',
      title: 'Collect ITR Documents',
      description: 'Collect all required ITR documents from client',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      due_date: '2024-04-10',
      assigned_to: 'staff-001',
    },
    {
      ca_id: 'ca-user-001',
      client_id: 'client-003',
      title: 'Review Financial Statements',
      description: 'Review and verify financial statements',
      status: 'PENDING',
      priority: 'MEDIUM',
      due_date: '2024-04-15',
      assigned_to: null,
    },
  ];

  await supabase.from('tasks').insert(tasks);
}

async function seedCompliance() {
  const compliance = [
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      item_name: 'GST Filing - March 2024',
      item_type: 'GST_FILING',
      status: 'COMPLETED',
      due_date: '2024-03-31',
      completed_date: '2024-03-31',
      financial_year: '2023-24',
    },
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      item_name: 'TDS Filing - Q4 2023',
      item_type: 'TDS_FILING',
      status: 'PENDING',
      due_date: '2024-06-30',
      completed_date: null,
      financial_year: '2023-24',
    },
  ];

  await supabase.from('compliance_tracking').insert(compliance);
}

async function seedGSTITR() {
  const gstData = [
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      return_type: 'GSTR1',
      filing_period: '2024-03',
      status: 'FILED',
      arn: 'ARN-123456789',
      filing_date: '2024-03-31',
      financial_year: '2023-24',
    },
  ];

  const itrData = [
    {
      ca_id: 'ca-user-001',
      client_id: 'client-001',
      itr_type: 'ITR1',
      filing_period: '2024',
      status: 'DRAFT',
      gross_income: 750000,
      taxable_income: 500000,
      tax_payable: 125000,
      financial_year: '2023-24',
    },
  ];

  await supabase.from('gst_filings').insert(gstData);
  await supabase.from('itr_filings').insert(itrData);
}

async function seedWorkflows() {
  const workflows = [
    {
      ca_id: 'ca-user-001',
      name: 'Monthly GST Filing',
      description: 'Automated monthly GST return filing',
      trigger_type: 'SCHEDULED',
      trigger_value: 'MONTHLY',
      status: 'ACTIVE',
      actions: [
        { type: 'COLLECT_DOCUMENTS', order: 1 },
        { type: 'VALIDATE_DATA', order: 2 },
        { type: 'GENERATE_RETURN', order: 3 },
      ],
    },
    {
      ca_id: 'ca-user-001',
      name: 'Document Expiry Alerts',
      description: 'Alert for expiring documents',
      trigger_type: 'SCHEDULED',
      trigger_value: 'DAILY',
      status: 'ACTIVE',
      actions: [
        { type: 'CHECK_EXPIRY', order: 1 },
        { type: 'SEND_ALERT', order: 2 },
      ],
    },
  ];

  await supabase.from('workflows').insert(workflows);
}
