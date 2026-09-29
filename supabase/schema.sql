-- ============================================================================
-- TaxMate - Enterprise Supabase Master Database Schema (v4.0)
-- Authoritative, production-ready single source of truth for Supabase DB setup.
-- Keep this file tracked. Store local SQL experiments in *.sql.local files.

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  app_role TEXT;
  user_role_meta TEXT;
BEGIN
  app_role := COALESCE(NULLIF(UPPER(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '');
  user_role_meta := COALESCE(NULLIF(UPPER(auth.jwt() -> 'user_metadata' ->> 'role'), ''), '');

  RETURN app_role IN ('SUPER_ADMIN', 'ADMIN') OR user_role_meta IN ('SUPER_ADMIN', 'ADMIN');
END;
$$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'CA', 'CLIENT', 'STAFF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT'::user_role,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON public.profiles(last_login_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin_user());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin_user());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_user())
  WITH CHECK (auth.uid() = id OR public.is_admin_user());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin_user());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
  extracted_role user_role := 'CLIENT'::user_role;
  extracted_name TEXT;
BEGIN
  extracted_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  BEGIN
    extracted_role := COALESCE(NULLIF(UPPER(NEW.raw_user_meta_data->>'role'), '')::user_role, 'CLIENT'::user_role);
  EXCEPTION WHEN others THEN
    extracted_role := 'CLIENT'::user_role;
  END;

  INSERT INTO public.profiles (id, email, full_name, role, is_verified, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_name,
    extracted_role,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    is_verified = EXCLUDED.is_verified,
    metadata = COALESCE(EXCLUDED.metadata, public.profiles.metadata),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();
-- File: supabase/schema.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE ca_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED', 'ON_HOLD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('RAZORPAY', 'STRIPE', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE filing_type AS ENUM ('ITR_1', 'ITR_2', 'ITR_3', 'ITR_4', 'GSTR_1', 'GSTR_3B', 'GSTR_9', 'TDS_24Q', 'TDS_26Q', 'ADVANCE_TAX', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE filing_status AS ENUM ('NOT_STARTED', 'DOCUMENT_COLLECTION', 'IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM ('VIDEO_CALL', 'IN_PERSON', 'PHONE_CALL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE',
    'INVOICE_SENT', 'INVOICE_PAID', 'INVOICE_OVERDUE',
    'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'DOCUMENT_SHARED',
    'APPOINTMENT_BOOKED', 'APPOINTMENT_REMINDER', 'MESSAGE_RECEIVED',
    'FILING_DEADLINE', 'CA_APPROVED', 'SYSTEM_ANNOUNCEMENT', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIALING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'OFFICE_SUPPLIES', 'TRAVEL', 'MEALS', 'SOFTWARE', 'HARDWARE',
    'MARKETING', 'LEGAL', 'UTILITIES', 'RENT', 'SALARIES',
    'PROFESSIONAL_FEES', 'TAXES', 'INSURANCE', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE security_alert_type AS ENUM (
    'password_changed', 'password_reset_requested', 'login_attempt_failed',
    'suspicious_login', 'email_changed', 'phone_changed',
    'two_factor_enabled', 'two_factor_disabled', 'api_key_generated',
    'api_key_revoked', 'account_locked', 'account_unlocked',
    'permission_changed', 'device_added', 'device_removed', 'unusual_activity'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE esignature_status AS ENUM ('pending', 'signed', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE presence_status AS ENUM ('online', 'away', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'pending_client', 'under_review', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 3. CORE USER & ACCOUNT TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  avatar_url TEXT,
  role user_role DEFAULT 'CLIENT'::user_role,
  status user_status DEFAULT 'PENDING_VERIFICATION'::user_status,
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));

-- User Profiles: Extended personal profile
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

-- CA Profiles: CA professional information
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

-- Client Profiles: Client entity information
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
  firm_type TEXT NOT NULL DEFAULT 'sole_proprietary',
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
  verification_status TEXT DEFAULT 'pending',
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
  role TEXT NOT NULL DEFAULT 'member',
  joining_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

-- CA-Client Relationships
CREATE TABLE IF NOT EXISTS public.ca_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  relationship_type TEXT DEFAULT 'tax_consultant',
  permissions TEXT[] DEFAULT ARRAY['view_documents', 'create_tasks']::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ca_id, client_id)
);

-- CA Services Catalog
CREATE TABLE IF NOT EXISTS public.ca_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  turnaround_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CA Specializations
CREATE TABLE IF NOT EXISTS public.ca_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialization_code TEXT NOT NULL,
  specialization_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ca_id, specialization_code)
);

-- User Sessions
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

-- User Presence & Realtime Status
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  status presence_status DEFAULT 'offline'::presence_status,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  current_page TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
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

-- Onboarding
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

-- ============================================================================
-- 4. TASK & CASE MANAGEMENT TABLES
-- ============================================================================

-- Tasks
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

-- Task Comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL,
  service_type TEXT,
  status case_status DEFAULT 'open'::case_status,
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

-- Case Activities
CREATE TABLE IF NOT EXISTS public.case_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  work_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DOCUMENT MANAGEMENT & DIGITAL SIGNATURES
-- ============================================================================

-- Documents
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

-- E-Signature Requests
CREATE TABLE IF NOT EXISTS public.esignature_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  status esignature_status DEFAULT 'pending'::esignature_status,
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Uploads Tracking
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. FINANCIAL, INVOICING & SUBSCRIPTION TABLES
-- ============================================================================

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  status invoice_status DEFAULT 'DRAFT'::invoice_status,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
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

-- Expenses
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

-- Subscriptions
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
-- 7. TAX FILING & COMPLIANCE TABLES
-- ============================================================================

-- Tax Filings
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

-- Tax Form Templates
CREATE TABLE IF NOT EXISTS public.tax_form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_code TEXT NOT NULL UNIQUE,
  form_name TEXT NOT NULL,
  description TEXT,
  country TEXT DEFAULT 'IN',
  category TEXT DEFAULT 'direct_tax',
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  field_mappings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Tax Forms
CREATE TABLE IF NOT EXISTS public.client_tax_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.tax_form_templates(id) ON DELETE SET NULL,
  form_code TEXT NOT NULL,
  form_name TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  form_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  completion_percentage INTEGER DEFAULT 0,
  missing_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Items
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

-- Compliance Filings Tracking
CREATE TABLE IF NOT EXISTS public.compliance_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filing_type TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  period TEXT,
  due_date DATE NOT NULL,
  filing_date DATE,
  status TEXT DEFAULT 'pending',
  ack_number TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Calendar & Standard Deadlines
CREATE TABLE IF NOT EXISTS public.compliance_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  filing_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  applicable_to TEXT DEFAULT 'all',
  description TEXT,
  penalty_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES public.users(id),
  compliance_type TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  verification_date TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Automation Rules
CREATE TABLE IF NOT EXISTS public.compliance_automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. COMMUNICATION, MESSAGING & REALTIME TABLES
-- ============================================================================

-- Appointments
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

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages
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

-- Message Read Receipts
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Typing Indicators
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Notifications
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

-- Notification Preferences
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

-- Activity Logs & Feed
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

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Notes
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Notes
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

-- Team Members
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

-- ============================================================================
-- 9. SECURITY, SYSTEM LOGS & AUDIT TABLES
-- ============================================================================

-- Security Alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type security_alert_type NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
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
  acknowledgment_action TEXT,
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
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Login Attempt Logs
CREATE TABLE IF NOT EXISTS public.login_attempt_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info TEXT,
  failure_reason TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification Tokens
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
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

-- Blog Posts
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

-- Support Tickets
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

-- Feature Flags
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

-- Audit Logs
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

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Subscribers
CREATE TABLE IF NOT EXISTS public.maintenance_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

-- ============================================================================
-- 10. COMPATIBILITY VIEWS
-- ============================================================================

-- ============================================================================
-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
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
CREATE INDEX IF NOT EXISTS idx_ca_firm_members_firm_id ON public.ca_firm_members(firm_id);
CREATE INDEX IF NOT EXISTS idx_ca_firm_members_user_id ON public.ca_firm_members(user_id);

CREATE INDEX IF NOT EXISTS idx_ca_client_rel_ca_id ON public.ca_client_relationships(ca_id);
CREATE INDEX IF NOT EXISTS idx_ca_client_rel_client_id ON public.ca_client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_ca_services_ca_id ON public.ca_services(ca_id);

CREATE INDEX IF NOT EXISTS idx_tasks_ca_id ON public.tasks(ca_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_cases_ca_id ON public.cases(ca_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_ca_id ON public.documents(ca_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);

CREATE INDEX IF NOT EXISTS idx_esignature_document_id ON public.esignature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_esignature_signer_id ON public.esignature_requests(signer_id);

CREATE INDEX IF NOT EXISTS idx_invoices_ca_id ON public.invoices(ca_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_ca_id ON public.payments(ca_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);

CREATE INDEX IF NOT EXISTS idx_tax_filings_ca_id ON public.tax_filings(ca_id);
CREATE INDEX IF NOT EXISTS idx_tax_filings_client_id ON public.tax_filings(client_id);

CREATE INDEX IF NOT EXISTS idx_compliance_items_ca_id ON public.compliance_items(ca_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_client_id ON public.compliance_items(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_due_date ON public.compliance_items(due_date);

CREATE INDEX IF NOT EXISTS idx_appointments_ca_id ON public.appointments(ca_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);

CREATE INDEX IF NOT EXISTS idx_conversations_ca_id ON public.conversations(ca_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_email ON public.login_attempt_logs(email);

-- ============================================================================
-- 12. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_ca_firms_updated_at BEFORE UPDATE ON public.ca_firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_ca_firm_members_updated_at BEFORE UPDATE ON public.ca_firm_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_ca_client_rel_updated_at BEFORE UPDATE ON public.ca_client_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_ca_services_updated_at BEFORE UPDATE ON public.ca_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_presence_updated_at BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_onboarding_updated_at BEFORE UPDATE ON public.onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_esignature_requests_updated_at BEFORE UPDATE ON public.esignature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_tax_filings_updated_at BEFORE UPDATE ON public.tax_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_tax_form_templates_updated_at BEFORE UPDATE ON public.tax_form_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_client_tax_forms_updated_at BEFORE UPDATE ON public.client_tax_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_compliance_items_updated_at BEFORE UPDATE ON public.compliance_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_compliance_filings_updated_at BEFORE UPDATE ON public.compliance_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_firm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esignature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tax_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempt_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_subscribers ENABLE ROW LEVEL SECURITY;

-- General Open & Self RLS Rules for Supabase
CREATE POLICY users_self_select ON public.users FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY users_self_update ON public.users FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY user_profiles_all ON public.user_profiles FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY ca_profiles_public_select ON public.ca_profiles FOR SELECT USING (public_profile = TRUE OR auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY ca_profiles_self_update ON public.ca_profiles FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY client_profiles_self ON public.client_profiles FOR ALL USING (auth.uid() = user_id OR auth.uid() = ca_id OR auth.role() = 'service_role');
CREATE POLICY ca_firms_access ON public.ca_firms FOR ALL USING (ca_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY ca_client_rel_access ON public.ca_client_relationships FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY ca_services_read ON public.ca_services FOR SELECT USING (TRUE);
CREATE POLICY ca_services_write ON public.ca_services FOR ALL USING (ca_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY tasks_access ON public.tasks FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR assigned_to = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY cases_access ON public.cases FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR assigned_to = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY documents_access ON public.documents FOR ALL USING (user_id = auth.uid() OR ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY esignature_access ON public.esignature_requests FOR ALL USING (requester_id = auth.uid() OR signer_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY invoices_access ON public.invoices FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY payments_access ON public.payments FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY tax_filings_access ON public.tax_filings FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY compliance_items_access ON public.compliance_items FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY appointments_access ON public.appointments FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY conversations_access ON public.conversations FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY messages_access ON public.messages FOR ALL USING (
  sender_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (ca_id = auth.uid() OR client_id = auth.uid())
  ) OR auth.role() = 'service_role'
);

CREATE POLICY notifications_access ON public.notifications FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY notification_prefs_access ON public.notification_preferences FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY security_alerts_access ON public.security_alerts FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY settings_access ON public.settings FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY feature_flags_read ON public.feature_flags FOR SELECT USING (TRUE);
CREATE POLICY system_settings_read ON public.system_settings FOR SELECT USING (TRUE);
CREATE POLICY maintenance_subscribers_insert ON public.maintenance_subscribers FOR INSERT WITH CHECK (TRUE);

-- Service Role Full Access Fallback Policies
CREATE POLICY service_role_all_users ON public.users FOR ALL TO service_role USING (TRUE);
CREATE POLICY service_role_all_profiles ON public.user_profiles FOR ALL TO service_role USING (TRUE);
CREATE POLICY service_role_all_ca ON public.ca_profiles FOR ALL TO service_role USING (TRUE);
CREATE POLICY service_role_all_client ON public.client_profiles FOR ALL TO service_role USING (TRUE);

-- ============================================================================
-- 14. REAL-TIME REPLICATION CONFIGURATION
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ca_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.esignature_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ca_firms;

-- ============================================================================
-- 15. STORAGE BUCKETS SETUP & RLS POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/zip']),
  ('invoice-pdfs', 'invoice-pdfs', false, 10485760, ARRAY['application/pdf']),
  ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('ca-assets', 'ca-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('chat-files', 'chat-files', false, 52428800, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/zip'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Public Read CA Assets" ON storage.objects FOR SELECT USING (bucket_id = 'ca-assets');
CREATE POLICY "Authenticated Upload CA Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ca-assets' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Documents Access" ON storage.objects;
CREATE POLICY "Users Manage Own Documents" ON storage.objects
  FOR ALL
  USING (
    bucket_id IN ('documents', 'invoice-pdfs', 'receipts', 'chat-files')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('documents', 'invoice-pdfs', 'receipts', 'chat-files')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 16. DEFAULT SYSTEM SEED DATA
-- ============================================================================

INSERT INTO public.system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable or disable global maintenance mode'),
  ('maintenance_message', 'We are performing scheduled maintenance. We will be back shortly.', 'Message shown on maintenance screen'),
  ('maintenance_bypass_key', '', 'Secret key to bypass maintenance mode'),
  ('app_version', '1.0.0', 'Current TaxMate application version'),
  ('default_subscription_plan', 'free', 'Default subscription tier for new users')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.users (id, email, password_hash, name, role, status, onboarding_completed)
VALUES 
  ('d3b07384-d113-4956-a534-7c24434ff601', 'admin@taxmate.com', '$2a$12$R.S4wI23YfD4NzeA7pM5fO1g6H77WlGkO/v82iKqJm8V8yW064cQO', 'System Admin', 'SUPER_ADMIN', 'ACTIVE', TRUE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
