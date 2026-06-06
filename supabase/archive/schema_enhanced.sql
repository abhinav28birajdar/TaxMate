-- ============================================
-- TAXMATE ENHANCED DATABASE SCHEMA
-- ============================================

-- GST MANAGEMENT TABLES
CREATE TABLE gst_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  gstr_type VARCHAR(50) NOT NULL, -- gstr1, gstr2, gstr3b, gstr9
  filing_date TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'not-started', -- not-started, in-progress, filed, overdue, amended
  total_invoice NUMERIC DEFAULT 0,
  total_tax NUMERIC DEFAULT 0,
  total_itc NUMERIC DEFAULT 0,
  notes TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, month, year, gstr_type)
);

CREATE TABLE gst_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gstr_type VARCHAR(50) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  due_date TIMESTAMP NOT NULL,
  reminder_sent_dates JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending'
);

-- ITR MANAGEMENT TABLES
CREATE TABLE itr_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  financial_year VARCHAR(20) NOT NULL,
  itr_type VARCHAR(50) NOT NULL, -- itr1, itr2, itr3, itr4, itr5, itr6, itr7
  filing_date TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'not-started',
  gross_income NUMERIC DEFAULT 0,
  taxable_income NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  refund_amount NUMERIC,
  acknowledge_number VARCHAR(255),
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, financial_year, itr_type)
);

CREATE TABLE itr_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  financial_year VARCHAR(20) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  reminder_sent_dates JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending'
);

-- COMPLIANCE MANAGEMENT TABLES
CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- gst, itr, tds, esi, epf, audit, other
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'not-started',
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  frequency VARCHAR(50) DEFAULT 'once', -- once, monthly, quarterly, yearly
  checklist JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compliance_due_date ON compliance_items(due_date);
CREATE INDEX idx_compliance_status ON compliance_items(status);

-- FINANCIAL ANALYTICS TABLES
CREATE TABLE financial_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  profit_margin NUMERIC DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  average_invoice_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ca_id, month, year)
);

CREATE TABLE revenue_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  by_service JSONB DEFAULT '{}',
  by_client JSONB DEFAULT '{}',
  total_revenue NUMERIC DEFAULT 0,
  growth NUMERIC DEFAULT 0,
  trend VARCHAR(50) DEFAULT 'stable', -- up, down, stable
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  gross_revenue NUMERIC DEFAULT 0,
  expenses NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  gst_collected NUMERIC DEFAULT 0,
  gst_paid NUMERIC DEFAULT 0,
  net_gst NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INVOICING TABLES
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  items JSONB NOT NULL, -- [{description, quantity, rate, amount, taxable}]
  tax_rate NUMERIC DEFAULT 0,
  terms TEXT,
  notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES invoice_templates(id),
  frequency VARCHAR(50) NOT NULL, -- weekly, biweekly, monthly, quarterly, yearly
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  next_due_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  auto_send BOOLEAN DEFAULT FALSE,
  last_generated_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, paid, overdue
  days_overdue INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  next_reminder_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TEAM COLLABORATION TABLES
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  department VARCHAR(255),
  permissions JSONB DEFAULT '[]',
  assigned_clients JSONB DEFAULT '[]',
  assigned_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  performance_score NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  join_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(ca_id, user_id)
);

CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, in-progress, completed, rejected
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- EXPENSE TRACKING TABLES
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  category VARCHAR(255) NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  expense_date TIMESTAMP NOT NULL,
  bill_number VARCHAR(255),
  gst_amount NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  color VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(ca_id, name)
);

-- PERFORMANCE METRICS TABLES
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  clients_onboarded INTEGER DEFAULT 0,
  clients_retained INTEGER DEFAULT 0,
  average_client_lifespan INTEGER DEFAULT 0,
  task_completion_rate NUMERIC DEFAULT 0,
  invoice_collection_rate NUMERIC DEFAULT 0,
  average_response_time NUMERIC DEFAULT 0,
  customer_satisfaction_score NUMERIC DEFAULT 0,
  total_revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATION PREFERENCE TABLES
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  compliance_alerts BOOLEAN DEFAULT TRUE,
  invoice_reminders BOOLEAN DEFAULT TRUE,
  task_assignments BOOLEAN DEFAULT TRUE,
  document_uploads BOOLEAN DEFAULT FALSE,
  payment_updates BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE smart_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- compliance, invoice, task, document, payment, gst, itr, system
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON smart_notifications(user_id, is_read);

-- DOCUMENT INTELLIGENCE TABLES
CREATE TABLE document_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  extracted_data JSONB DEFAULT '{}',
  category VARCHAR(255),
  confidence NUMERIC DEFAULT 0,
  suggested_tags JSONB DEFAULT '[]',
  expiry_date TIMESTAMP,
  importance VARCHAR(50) DEFAULT 'medium', -- low, medium, high
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id)
);

CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  extracted_text TEXT,
  confidence NUMERIC DEFAULT 0,
  entities JSONB DEFAULT '{}',
  tables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id)
);

-- CALENDAR & SCHEDULING TABLES
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- meeting, deadline, filing, reminder, holiday
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  attendees JSONB DEFAULT '[]',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  reminders JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE slot_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL, -- in minutes
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(ca_id, day_of_week, start_time, end_time)
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type VARCHAR(50) NOT NULL, -- video, phone, in-person, email
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no-show
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT & ACTIVITY TABLES
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  changes JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_ca_id ON audit_logs(ca_id, timestamp);

CREATE TABLE activity_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- client, document, task, invoice, chat, compliance, gst, itr
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_activity_ca_id ON activity_feeds(ca_id, timestamp);

-- CLIENT PORTAL TABLES
CREATE TABLE client_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) DEFAULT 'limited', -- view, limited, full
  can_upload_documents BOOLEAN DEFAULT TRUE,
  can_view_invoices BOOLEAN DEFAULT TRUE,
  can_request_services BOOLEAN DEFAULT TRUE,
  can_chat BOOLEAN DEFAULT TRUE,
  last_access_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id VARCHAR(255),
  service_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'requested', -- requested, quoted, accepted, in-progress, completed, rejected
  request_date TIMESTAMP DEFAULT NOW(),
  required_by TIMESTAMP,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  documents JSONB DEFAULT '[]',
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AUTOMATION TABLES
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'success', -- success, failed
  result TEXT,
  error TEXT
);

-- REPORTING TABLES
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- revenue, client, compliance, financial, team, custom
  filters JSONB DEFAULT '{}',
  frequency VARCHAR(50) DEFAULT 'once', -- once, daily, weekly, monthly, quarterly, yearly
  recipients JSONB DEFAULT '[]',
  is_scheduled BOOLEAN DEFAULT FALSE,
  last_generated_date TIMESTAMP,
  next_generation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE report_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  generated_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}',
  chart_data JSONB,
  summary TEXT,
  export_formats JSONB DEFAULT '["pdf", "excel", "csv"]'
);

-- Create indexes for performance
CREATE INDEX idx_gst_due_date ON gst_records(due_date);
CREATE INDEX idx_itr_due_date ON itr_records(due_date);
CREATE INDEX idx_compliance_ca ON compliance_items(ca_id);
CREATE INDEX idx_invoices_ca ON invoices(ca_id);
CREATE INDEX idx_tasks_ca ON tasks(ca_id);
CREATE INDEX idx_documents_ca ON documents(ca_id);
CREATE INDEX idx_financial_metrics_ca ON financial_metrics(ca_id);

-- Enable RLS on sensitive tables
ALTER TABLE gst_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GST records
CREATE POLICY gst_records_ca_policy ON gst_records
  FOR SELECT USING (ca_id = auth.uid());

CREATE POLICY gst_records_client_policy ON gst_records
  FOR SELECT USING (client_id IN (
    SELECT id FROM clients WHERE ca_id = auth.uid()
  ));

-- RLS Policies for ITR records
CREATE POLICY itr_records_ca_policy ON itr_records
  FOR SELECT USING (ca_id = auth.uid());

-- RLS Policies for Compliance items
CREATE POLICY compliance_ca_policy ON compliance_items
  FOR SELECT USING (ca_id = auth.uid());

-- Views for common queries
CREATE VIEW ca_dashboard_view AS
SELECT 
  ca_id,
  COUNT(DISTINCT client_id) as total_clients,
  COUNT(DISTINCT CASE WHEN status = 'active' THEN client_id END) as active_clients,
  COUNT(*) as total_invoices,
  COALESCE(SUM(amount), 0) as total_revenue
FROM invoices
GROUP BY ca_id;

CREATE VIEW compliance_due_soon AS
SELECT 
  *,
  EXTRACT(DAY FROM due_date - NOW()) as days_until_due
FROM compliance_items
WHERE status != 'completed'
  AND due_date > NOW()
  AND due_date < NOW() + INTERVAL '7 days';

CREATE VIEW gst_filing_status AS
SELECT 
  ca_id,
  client_id,
  CASE WHEN filing_date IS NULL THEN 'pending'
       WHEN filing_date > due_date THEN 'overdue'
       ELSE 'filed' END as status,
  COUNT(*) as count
FROM gst_records
GROUP BY ca_id, client_id, status;
