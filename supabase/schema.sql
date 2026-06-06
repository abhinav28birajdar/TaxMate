-- TaxMate Complete Production Schema (v2.0)
-- Single source of truth for all database design
-- This file is AUTHORITATIVE and should NEVER be duplicated
-- Generated: 2026-04-08

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'CA', 'CLIENT', 'STAFF');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION', 'SUSPENDED');
CREATE TYPE ca_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED', 'ON_HOLD');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE payment_gateway AS ENUM ('RAZORPAY', 'STRIPE', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE');
CREATE TYPE filing_type AS ENUM ('ITR_1', 'ITR_2', 'ITR_3', 'ITR_4', 'GSTR_1', 'GSTR_3B', 'GSTR_9', 'TDS_24Q', 'TDS_26Q', 'ADVANCE_TAX', 'OTHER');
CREATE TYPE filing_status AS ENUM ('NOT_STARTED', 'DOCUMENT_COLLECTION', 'IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED', 'CANCELLED');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE appointment_type AS ENUM ('VIDEO_CALL', 'IN_PERSON', 'PHONE_CALL');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'SYSTEM');
CREATE TYPE notification_type AS ENUM ('TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE', 'INVOICE_SENT', 'INVOICE_PAID', 'INVOICE_OVERDUE', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'DOCUMENT_SHARED', 'APPOINTMENT_BOOKED', 'APPOINTMENT_REMINDER', 'MESSAGE_RECEIVED', 'FILING_DEADLINE', 'CA_APPROVED', 'SYSTEM_ANNOUNCEMENT', 'OTHER');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIALING');
CREATE TYPE expense_category AS ENUM ('OFFICE_SUPPLIES', 'TRAVEL', 'MEALS', 'SOFTWARE', 'HARDWARE', 'MARKETING', 'LEGAL', 'UTILITIES', 'RENT', 'SALARIES', 'PROFESSIONAL_FEES', 'TAXES', 'INSURANCE', 'OTHER');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users: Main user table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  role user_role DEFAULT 'CLIENT'::user_role,
  status user_status DEFAULT 'PENDING_VERIFICATION'::user_status,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  locale TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles: Extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  company_name TEXT,
  job_title TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CA Profiles: Chartered Accountant specific data
CREATE TABLE IF NOT EXISTS ca_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  icai_membership_number TEXT UNIQUE,
  firm_name TEXT,
  designation TEXT DEFAULT 'Chartered Accountant',
  bio TEXT,
  years_of_experience INTEGER DEFAULT 0,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
  status ca_status DEFAULT 'PENDING'::ca_status,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  office_address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  website_url TEXT,
  linkedin_url TEXT,
  gstin TEXT,
  pan_number TEXT UNIQUE,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  consultation_fee DECIMAL(10, 2),
  accepts_online_payment BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE,
  slug TEXT UNIQUE,
  total_clients INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  signature_url TEXT,
  letterhead_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Profiles: Client specific data
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id),
  pan_number TEXT UNIQUE,
  aadhaar_number TEXT,
  date_of_birth DATE,
  business_name TEXT,
  business_type TEXT,
  gstin TEXT,
  industry TEXT,
  annual_turnover DECIMAL(15, 2),
  city TEXT,
  state TEXT,
  pincode TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions: User session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings: User application settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  two_factor_method TEXT DEFAULT 'email',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding: Track user onboarding progress
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  skipped_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMUNICATION TABLES
-- ============================================================================

-- Notifications: Push, email, SMS notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type notification_type DEFAULT 'OTHER'::notification_type,
  related_entity_type TEXT,
  related_entity_id UUID,
  read_at TIMESTAMPTZ,
  read BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Preferences: User notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  task_notifications BOOLEAN DEFAULT TRUE,
  invoice_notifications BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  appointment_notifications BOOLEAN DEFAULT TRUE,
  email_digest BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs: Track user and system activities
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TASK MANAGEMENT TABLES
-- ============================================================================

-- Tasks: Main task entity
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO'::task_status,
  priority task_priority DEFAULT 'MEDIUM'::task_priority,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT TABLES
-- ============================================================================

-- Documents: File storage and management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  document_type TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL TABLES
-- ============================================================================

-- Invoices: Invoice management
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status invoice_status DEFAULT 'DRAFT'::invoice_status,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments: Payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status payment_status DEFAULT 'PENDING'::payment_status,
  gateway payment_gateway DEFAULT 'RAZORPAY'::payment_gateway,
  gateway_transaction_id TEXT UNIQUE,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  payment_method TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses: Expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category expense_category NOT NULL,
  expense_date DATE,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAX FILING TABLES
-- ============================================================================

-- Tax Filings: Tax return status and management
CREATE TABLE IF NOT EXISTS tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filing_type filing_type NOT NULL,
  financial_year TEXT NOT NULL,
  status filing_status DEFAULT 'NOT_STARTED'::filing_status,
  submission_date DATE,
  acknowledgment_number TEXT UNIQUE,
  documents_required TEXT[],
  documents_collected TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE TABLES
-- ============================================================================

-- Compliance Items: Track compliance requirements and deadlines
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  compliance_type TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  due_date DATE NOT NULL,
  reminder_date DATE,
  status TEXT DEFAULT 'not-started',
  priority task_priority DEFAULT 'MEDIUM'::task_priority,
  document_checklist JSONB DEFAULT '[]'::jsonb,
  estimated_hours DECIMAL(5, 2),
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CASE MANAGEMENT TABLES
-- ============================================================================

-- Cases: Legal/tax case management
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority task_priority DEFAULT 'MEDIUM'::task_priority,
  assigned_to UUID REFERENCES users(id),
  filing_date DATE,
  deadline DATE,
  resolution_date DATE,
  monetary_value DECIMAL(15, 2),
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENT TABLES
-- ============================================================================

-- Appointments: Meeting scheduling
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type appointment_type DEFAULT 'VIDEO_CALL'::appointment_type,
  title TEXT,
  description TEXT,
  status appointment_status DEFAULT 'PENDING'::appointment_status,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION TABLES
-- ============================================================================

-- Conversations: Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages: Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type message_type DEFAULT 'TEXT'::message_type,
  content TEXT NOT NULL,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTION TABLES
-- ============================================================================

-- Subscriptions: User subscription plans
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan subscription_plan DEFAULT 'FREE'::subscription_plan,
  status subscription_status DEFAULT 'ACTIVE'::subscription_status,
  billing_period_start DATE,
  billing_period_end DATE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  next_billing_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEW TABLES
-- ============================================================================

-- Reviews: CA reviews from clients
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADDITIONAL TABLES
-- ============================================================================

-- Notes: Quick notes and reminders
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members: CA firm team management
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ca_id, member_id)
);

-- Time Entries: Track time spent on tasks
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  work_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts: Content management
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets: Customer support
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 2,
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- CA Profiles indexes
CREATE INDEX IF NOT EXISTS idx_ca_profiles_user_id ON ca_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_status ON ca_profiles(status);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_slug ON ca_profiles(slug);

-- Client Profiles indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_ca_id ON client_profiles(ca_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(active);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_ca_id ON tasks(ca_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_ca_id ON documents(ca_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_ca_id ON invoices(ca_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_ca_id ON payments(ca_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_ca_id ON appointments(ca_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_ca_id ON conversations(ca_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_ca_profiles_updated_at BEFORE UPDATE ON ca_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_client_profiles_updated_at BEFORE UPDATE ON client_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_user_sessions_updated_at BEFORE UPDATE ON user_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_onboarding_updated_at BEFORE UPDATE ON onboarding
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notifications_updated_at BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_expenses_updated_at BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_tax_filings_updated_at BEFORE UPDATE ON tax_filings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_messages_updated_at BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_team_members_updated_at BEFORE UPDATE ON team_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_time_entries_updated_at BEFORE UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_blog_posts_updated_at BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_support_tickets_updated_at BEFORE UPDATE ON support_tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY users_self_select ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'SUPER_ADMIN'::user_role);

CREATE POLICY users_self_update ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR role = 'SUPER_ADMIN'::user_role);

-- RLS Policies for user_profiles (individuals can access their own profiles)
CREATE POLICY user_profiles_self_select ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_self_update ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_public_select ON user_profiles
  FOR SELECT USING (is_public = TRUE);

-- RLS Policies for ca_profiles (public read, self write)
CREATE POLICY ca_profiles_public_select ON ca_profiles
  FOR SELECT USING (public_profile = TRUE OR auth.uid()::text = user_id::text);

CREATE POLICY ca_profiles_self_update ON ca_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for client_profiles
CREATE POLICY client_profiles_self_select ON client_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = ca_id::text);

CREATE POLICY client_profiles_self_update ON client_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for tasks
CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text OR auth.uid()::text = assigned_to::text);

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- RLS Policies for documents
CREATE POLICY documents_select ON documents
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = ca_id::text OR 
    auth.uid()::text = client_id::text
  );

CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for invoices
CREATE POLICY invoices_select ON invoices
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY invoices_insert ON invoices
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY invoices_update ON invoices
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- RLS Policies for appointments
CREATE POLICY appointments_select ON appointments
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY appointments_insert ON appointments
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- RLS Policies for conversations
CREATE POLICY conversations_select ON conversations
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY conversations_insert ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- RLS Policies for messages
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR
    EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND 
      (conversations.ca_id = auth.uid() OR conversations.client_id = auth.uid()))
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- RLS Policies for notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for settings
CREATE POLICY settings_self_select ON settings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY settings_self_update ON settings
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for compliance_items
CREATE POLICY compliance_items_select ON compliance_items
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY compliance_items_insert ON compliance_items
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY compliance_items_update ON compliance_items
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- RLS Policies for cases
CREATE POLICY cases_select ON cases
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY cases_insert ON cases
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY cases_update ON cases
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- ============================================================================
-- INDEXES FOR NEW TABLES
-- ============================================================================

-- Compliance Items indexes
CREATE INDEX IF NOT EXISTS idx_compliance_items_ca_id ON compliance_items(ca_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_client_id ON compliance_items(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_due_date ON compliance_items(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_items_status ON compliance_items(status);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_ca_id ON cases(ca_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON cases(deadline);

-- ============================================================================
-- TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER tr_compliance_items_updated_at BEFORE UPDATE ON compliance_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REAL-TIME REPLICATION (for Supabase real-time subscriptions)
-- ============================================================================

-- Enable change data capture for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE ca_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE client_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_items;
ALTER PUBLICATION supabase_realtime ADD TABLE cases;

COMMIT;
