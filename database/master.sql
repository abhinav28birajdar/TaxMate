-- TaxMate Consolidated Master Database Schema (v3.0)
-- Authoritative single source of truth for Supabase DB setup
-- Generated: 2026-06-04

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

CREATE TYPE security_alert_type AS ENUM (
  'password_changed',
  'password_reset_requested',
  'login_attempt_failed',
  'suspicious_login',
  'email_changed',
  'phone_changed',
  'two_factor_enabled',
  'two_factor_disabled',
  'api_key_generated',
  'api_key_revoked',
  'account_locked',
  'account_unlocked',
  'permission_changed',
  'device_added',
  'device_removed',
  'unusual_activity'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users: Main user table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  avatar_url TEXT,
  role user_role DEFAULT 'CLIENT'::user_role,
  status user_status DEFAULT 'PENDING_VERIFICATION'::user_status,
  
  -- 2FA and Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  two_factor_verified BOOLEAN NOT NULL DEFAULT FALSE,
  password_changed_at TIMESTAMPTZ,
  password_change_required BOOLEAN NOT NULL DEFAULT FALSE,
  last_password_change TIMESTAMPTZ,
  security_alert_preference TEXT DEFAULT 'all',
  
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
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.ca_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
  approved_by UUID REFERENCES public.users(id),
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
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES public.users(id),
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

-- CA Firms
CREATE TABLE IF NOT EXISTS public.ca_firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  firm_registration_number TEXT UNIQUE,
  firm_type TEXT NOT NULL DEFAULT 'sole_proprietary', -- sole_proprietary, partnership, llp
  registration_year INTEGER,
  gst_number TEXT,
  pan_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  phone_primary TEXT,
  phone_secondary TEXT,
  email TEXT,
  website TEXT,
  total_employees INTEGER,
  total_clients INTEGER DEFAULT 0,
  registration_certificate_url TEXT,
  gst_certificate_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- CA Firm Members
CREATE TABLE IF NOT EXISTS public.ca_firm_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES public.ca_firms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- partner, lead_ca, ca, member, associate
  joining_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

-- Sessions: User session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings: User application settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type security_alert_type NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info TEXT,
  action_taken_by UUID REFERENCES public.users(id),
  action_taken_at TIMESTAMPTZ,
  action_details TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_user_id UUID REFERENCES public.users(id),
  acknowledgment_action TEXT, -- confirmed, denied, reported_suspicious
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  notification_sent BOOLEAN NOT NULL DEFAULT TRUE,
  notification_sent_at TIMESTAMPTZ,
  notification_read BOOLEAN NOT NULL DEFAULT FALSE,
  notification_read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password Change Logs
CREATE TABLE IF NOT EXISTS public.password_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  previous_password_hash TEXT NOT NULL,
  new_password_hash TEXT NOT NULL,
  change_reason TEXT, -- self_initiated, admin_forced, security_reset, expired, suspicious_activity
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Login Attempt Logs
CREATE TABLE IF NOT EXISTS public.login_attempt_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- success, failed, invalid_email, invalid_password, account_locked, two_factor_failed
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info TEXT,
  failure_reason TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT login_attempt_logs_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- TASK MANAGEMENT TABLES
-- ============================================================================

-- Tasks: Main task entity
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO'::task_status,
  priority task_priority DEFAULT 'MEDIUM'::task_priority,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.users(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT TABLES
-- ============================================================================

-- Documents: File storage and management
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES public.users(id),
  client_id UUID REFERENCES public.users(id),
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
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  assigned_to UUID REFERENCES public.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CASE MANAGEMENT TABLES
-- ============================================================================

-- Cases: Legal/tax case management
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority task_priority DEFAULT 'MEDIUM'::task_priority,
  assigned_to UUID REFERENCES public.users(id),
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
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages: Chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members: CA firm team management
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ca_id, member_id)
);

-- Time Entries: Track time spent on tasks
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  work_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts: Content management
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 2,
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Tokens: OTP and Email verification
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  type TEXT NOT NULL, -- 'OTP', 'EMAIL_VERIFICATION', 'PASSWORD_RESET'
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding Data: Step-by-step onboarding details
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  basic_info JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags: Admin controlled features
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs: Record database operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  row_id UUID,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Logs: General application logging
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_ca_profiles_user_id ON public.ca_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_status ON public.ca_profiles(status);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_slug ON public.ca_profiles(slug);

CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_ca_id ON public.client_profiles(ca_id);

CREATE INDEX IF NOT EXISTS idx_ca_firms_ca_id ON public.ca_firms(ca_id);
CREATE INDEX IF NOT EXISTS idx_ca_firms_firm_registration ON public.ca_firms(firm_registration_number);
CREATE INDEX IF NOT EXISTS idx_ca_firms_gst_number ON public.ca_firms(gst_number);
CREATE INDEX IF NOT EXISTS idx_ca_firms_verification_status ON public.ca_firms(verification_status);

CREATE INDEX IF NOT EXISTS idx_ca_firm_members_firm_id ON public.ca_firm_members(firm_id);
CREATE INDEX IF NOT EXISTS idx_ca_firm_members_user_id ON public.ca_firm_members(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(active);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_alert_type ON public.security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_is_resolved ON public.security_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_password_change_logs_user_id ON public.password_change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_password_change_logs_created_at ON public.password_change_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_user_id ON public.login_attempt_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_email ON public.login_attempt_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_attempt_type ON public.login_attempt_logs(attempt_type);
CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_created_at ON public.login_attempt_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_ca_id ON public.tasks(ca_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_ca_id ON public.documents(ca_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);

CREATE INDEX IF NOT EXISTS idx_invoices_ca_id ON public.invoices(ca_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_ca_id ON public.payments(ca_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_ca_id ON public.appointments(ca_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);

CREATE INDEX IF NOT EXISTS idx_conversations_ca_id ON public.conversations(ca_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_items_ca_id ON public.compliance_items(ca_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_client_id ON public.compliance_items(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_due_date ON public.compliance_items(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_items_status ON public.compliance_items(status);

CREATE INDEX IF NOT EXISTS idx_cases_ca_id ON public.cases(ca_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON public.cases(deadline);

-- ============================================================================
-- TIMESTAMP AUTO-UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ca_firms_updated_at BEFORE UPDATE ON public.ca_firms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_ca_firm_members_updated_at BEFORE UPDATE ON public.ca_firm_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_onboarding_updated_at BEFORE UPDATE ON public.onboarding
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notifications_updated_at BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_tax_filings_updated_at BEFORE UPDATE ON public.tax_filings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_messages_updated_at BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_team_members_updated_at BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_time_entries_updated_at BEFORE UPDATE ON public.time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_compliance_items_updated_at BEFORE UPDATE ON public.compliance_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON public.cases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_onboarding_data_updated_at BEFORE UPDATE ON public.onboarding_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_firm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempt_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'SUPER_ADMIN'::user_role);

CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text OR role = 'SUPER_ADMIN'::user_role);

-- 2. User Profiles policies
CREATE POLICY user_profiles_self_select ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_self_update ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_public_select ON public.user_profiles
  FOR SELECT USING (is_public = TRUE);

-- 3. CA Profiles policies
CREATE POLICY ca_profiles_public_select ON public.ca_profiles
  FOR SELECT USING (public_profile = TRUE OR auth.uid()::text = user_id::text);

CREATE POLICY ca_profiles_self_update ON public.ca_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 4. Client Profiles policies
CREATE POLICY client_profiles_self_select ON public.client_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = ca_id::text);

CREATE POLICY client_profiles_self_update ON public.client_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 5. CA Firms policies
CREATE POLICY ca_firms_select ON public.ca_firms
  FOR SELECT USING (
    ca_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.ca_firm_members WHERE firm_id = ca_firms.id AND user_id = auth.uid())
  );

CREATE POLICY ca_firms_insert ON public.ca_firms
  FOR INSERT WITH CHECK (ca_id = auth.uid());

CREATE POLICY ca_firms_update ON public.ca_firms
  FOR UPDATE USING (ca_id = auth.uid()) WITH CHECK (ca_id = auth.uid());

-- 6. Tasks policies
CREATE POLICY tasks_select ON public.tasks
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text OR auth.uid()::text = assigned_to::text);

CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 7. Documents policies
CREATE POLICY documents_select ON public.documents
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = ca_id::text OR 
    auth.uid()::text = client_id::text
  );

CREATE POLICY documents_insert ON public.documents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 8. Invoices policies
CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY invoices_insert ON public.invoices
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY invoices_update ON public.invoices
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 9. Appointments policies
CREATE POLICY appointments_select ON public.appointments
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY appointments_insert ON public.appointments
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 10. Conversations policies
CREATE POLICY conversations_select ON public.conversations
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY conversations_insert ON public.conversations
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 11. Messages policies
CREATE POLICY messages_select ON public.messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR
    EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND 
      (conversations.ca_id = auth.uid() OR conversations.client_id = auth.uid()))
  );

CREATE POLICY messages_insert ON public.messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- 12. Notifications policies
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 13. Settings policies
CREATE POLICY settings_self_select ON public.settings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY settings_self_update ON public.settings
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 14. Compliance Items policies
CREATE POLICY compliance_items_select ON public.compliance_items
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY compliance_items_insert ON public.compliance_items
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY compliance_items_update ON public.compliance_items
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 15. Cases policies
CREATE POLICY cases_select ON public.cases
  FOR SELECT USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

CREATE POLICY cases_insert ON public.cases
  FOR INSERT WITH CHECK (auth.uid()::text = ca_id::text);

CREATE POLICY cases_update ON public.cases
  FOR UPDATE USING (auth.uid()::text = ca_id::text OR auth.uid()::text = client_id::text);

-- 16. Security Alerts policies
CREATE POLICY security_alerts_select ON public.security_alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY security_alerts_insert ON public.security_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY security_alerts_update ON public.security_alerts
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 17. Password Change Logs policies
CREATE POLICY password_change_logs_select ON public.password_change_logs
  FOR SELECT USING (user_id = auth.uid());

-- 18. Login Attempt Logs policies
CREATE POLICY login_attempt_logs_select ON public.login_attempt_logs
  FOR SELECT USING (user_id = auth.uid());

-- 19. Verification Tokens policies
CREATE POLICY verification_tokens_select ON public.verification_tokens
  FOR SELECT USING (user_id = auth.uid());

-- 20. Onboarding Data policies
CREATE POLICY onboarding_data_select ON public.onboarding_data
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY onboarding_data_insert ON public.onboarding_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY onboarding_data_update ON public.onboarding_data
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 21. Feature Flags policies
CREATE POLICY feature_flags_select ON public.feature_flags
  FOR SELECT USING (TRUE);

CREATE POLICY feature_flags_admin ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN'::user_role
    )
  );

-- 22. Audit Logs policies
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT USING (
    changed_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN'::user_role
    )
  );

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 23. System Logs policies
CREATE POLICY system_logs_admin ON public.system_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN'::user_role
    )
  );

-- ============================================================================
-- REAL-TIME REPLICATION
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ca_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ca_firms;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_settings_read ON public.system_settings FOR SELECT USING (true);
CREATE POLICY system_settings_admin ON public.system_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN'::user_role
  )
);

-- Maintenance Subscribers Table
CREATE TABLE IF NOT EXISTS public.maintenance_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

ALTER TABLE public.maintenance_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_subscribers_insert ON public.maintenance_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY maintenance_subscribers_admin ON public.maintenance_subscribers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN'::user_role
  )
);

-- Seed System Settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable or disable global maintenance mode'),
  ('maintenance_message', 'We are performing scheduled maintenance. We will be back shortly.', 'Message shown on maintenance screen'),
  ('maintenance_bypass_key', '', 'Secret key to bypass maintenance mode'),
  ('maintenance_estimated_end', '', 'Estimated end time ISO timestamp'),
  ('maintenance_schedule_start', '', 'Scheduled maintenance start time ISO timestamp'),
  ('maintenance_schedule_end', '', 'Scheduled maintenance end time ISO timestamp'),
  ('app_version', '1.0.0', 'Current TaxMate application version'),
  ('default_subscription_plan', 'free', 'Default subscription tier for new firms')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.users (id, email, password_hash, name, role, status, onboarding_completed)
VALUES 
  ('d3b07384-d113-4956-a534-7c24434ff601', 'admin@taxmate.com', '$2a$12$R.S4wI23YfD4NzeA7pM5fO1g6H77WlGkO/v82iKqJm8V8yW064cQO', 'System Admin', 'SUPER_ADMIN', 'ACTIVE', TRUE)
ON CONFLICT DO NOTHING;

COMMIT;
