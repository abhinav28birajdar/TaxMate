-- ============================================
-- TAXMATE COMPLETE DATABASE SCHEMA
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role TEXT NOT NULL DEFAULT 'client', -- ca, client, staff, admin
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ CA PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS ca_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  firm_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  experience INTEGER,
  bio TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  certificate_number VARCHAR(100),
  license_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  total_revenue_monthly DECIMAL(12, 2) DEFAULT 0,
  specializations TEXT[], -- Array of specializations
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ CLIENTS TABLE ============
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  type TEXT NOT NULL DEFAULT 'individual', -- individual, business, startup
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  business_name VARCHAR(255),
  industry VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  tags TEXT[],
  status TEXT DEFAULT 'active', -- active, inactive, prospect
  notes TEXT,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ DOCUMENTS TABLE ============
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other', -- gst, itr, bank, pan, other, invoices, agreements
  file_size INTEGER,
  mime_type VARCHAR(100),
  version INTEGER DEFAULT 1,
  expiry_date TIMESTAMP,
  uploaded_by UUID REFERENCES users(id),
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ TASKS TABLE ============
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, in_review, completed, blocked
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date TIMESTAMP,
  completed_date TIMESTAMP,
  recurring_pattern TEXT DEFAULT 'none', -- none, daily, weekly, monthly, yearly
  next_recurring_date TIMESTAMP,
  checklist JSONB,
  attachments TEXT[],
  tags TEXT[],
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ SERVICES TABLE ============
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other', -- filing, compliance, consulting, audit, other
  base_pricing DECIMAL(10, 2),
  custom_pricing BOOLEAN DEFAULT FALSE,
  estimated_duration TEXT,
  required_documents TEXT[],
  deliverables TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ SERVICE REQUESTS TABLE ============
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, in_progress, completed, rejected
  quoted_price DECIMAL(10, 2),
  agreed_price DECIMAL(10, 2),
  start_date TIMESTAMP,
  completion_date TIMESTAMP,
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ INVOICES TABLE ============
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, sent, viewed, partially_paid, paid, overdue, cancelled
  issue_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  items JSONB NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_percentage DECIMAL(5, 2) DEFAULT 18,
  tax_amount DECIMAL(12, 2),
  total DECIMAL(12, 2) NOT NULL,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  amount_due DECIMAL(12, 2),
  notes TEXT,
  terms TEXT,
  attachments TEXT[],
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ PAYMENTS TABLE ============
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT FOR NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  method TEXT NOT NULL, -- razorpay, bank_transfer, upi, cheque, cash
  reference_number VARCHAR(100),
  transaction_id VARCHAR(100) UNIQUE,
  paid_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ APPOINTMENTS TABLE ============
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'meeting', -- meeting, call, consultation, audit, review
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER, -- in minutes
  meeting_link TEXT,
  location TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled
  reminders TEXT[],
  notes TEXT,
  participants UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ CHAT ROOMS TABLE ============
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  name VARCHAR(255),
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ MESSAGES TABLE ============
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  mentioned_user_ids UUID[],
  reactions JSONB,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ NOTIFICATIONS TABLE ============
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- task, document, payment, deadline, message, system, appointment
  title VARCHAR(255) NOT NULL,
  description TEXT,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  channels TEXT[], -- push, email, sms
  priority TEXT DEFAULT 'medium', -- low, medium, high
  linked_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ SESSIONS TABLE ============
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ VERIFICATION TOKENS TABLE ============
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  type TEXT NOT NULL, -- email_verification, password_reset, phone_verification
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ AUDIT LOGS TABLE ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- success, failure
  reason TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ============ COMPLIANCE TASKS TABLE ============
CREATE TABLE IF NOT EXISTS compliance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- gst_filing, itr_filing, audit, annual_return, compliance_check, other
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue, exempted
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  frequency TEXT, -- monthly, quarterly, half_yearly, annual, one_time
  next_due_date TIMESTAMP,
  documents TEXT[],
  notes TEXT,
  completed_date TIMESTAMP,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ GST FILINGS TABLE ============
CREATE TABLE IF NOT EXISTS gst_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL, -- YYYY-MM
  gstr1_total DECIMAL(12, 2),
  gstr2_total DECIMAL(12, 2),
  gst_liability DECIMAL(12, 2),
  inward_supplies DECIMAL(12, 2),
  outward_supplies DECIMAL(12, 2),
  credit_available DECIMAL(12, 2),
  filed_date TIMESTAMP,
  status TEXT DEFAULT 'pending', -- pending, filed, under_review, completed, rejected
  ref_number VARCHAR(100),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ ITR FILINGS TABLE ============
CREATE TABLE IF NOT EXISTS itr_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  financial_year VARCHAR(10) NOT NULL, -- 2023-24
  gross_income DECIMAL(15, 2),
  net_income DECIMAL(15, 2),
  tax DECIMAL(15, 2),
  filed_date TIMESTAMP,
  status TEXT DEFAULT 'pending', -- pending, filed, processed, accepted, rejected
  ref_number VARCHAR(100),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ RATINGS TABLE ============
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category TEXT, -- communication, expertise, timeliness, value, overall
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ REVIEWS TABLE ============
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ SUBSCRIPTIONS TABLE ============
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'basic', -- basic, pro, enterprise
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  monthly_price DECIMAL(8, 2),
  yearly_price DECIMAL(8, 2),
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  features TEXT[],
  client_limit INTEGER,
  storage_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ AUTOMATION RULES TABLE ============
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clients_ca_id ON clients(ca_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ca_id ON tasks(ca_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_ca_id ON invoices(ca_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_client_id ON compliance_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_gst_filings_client_id ON gst_filings(client_id);
CREATE INDEX IF NOT EXISTS idx_itr_filings_client_id ON itr_filings(client_id);

-- ============ ROW LEVEL SECURITY ============

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view themselves" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Clients policies
CREATE POLICY "CAs can view their own clients" ON clients
  FOR SELECT USING (ca_id = auth.uid());

CREATE POLICY "Clients can view their own profile" ON clients
  FOR SELECT USING (id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (ca_id = auth.uid() OR client_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their rooms" ON messages
  FOR SELECT USING (room_id IN (
    SELECT id FROM chat_rooms WHERE auth.uid() = ANY(participant_ids)
  ));

-- ============ STORED FUNCTIONS ============

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get CA insights
CREATE OR REPLACE FUNCTION get_ca_insights(ca_id_param UUID)
RETURNS TABLE (
  total_clients BIGINT,
  total_revenue NUMERIC,
  pending_tasks BIGINT,
  completed_tasks BIGINT,
  unpaid_invoices BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id)::BIGINT,
    COALESCE(SUM(i.total), 0)::NUMERIC,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN i.status IN ('draft', 'sent', 'overdue') THEN 1 END)::BIGINT
  FROM clients c
  LEFT JOIN invoices i ON c.id = i.client_id
  LEFT JOIN tasks t ON c.id = t.client_id
  WHERE c.ca_id = ca_id_param;
END;
$$ LANGUAGE plpgsql;
