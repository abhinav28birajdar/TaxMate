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
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  app_role := COALESCE(NULLIF(UPPER(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '');

  RETURN app_role IN ('SUPER_ADMIN', 'ADMIN');
END;
$$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'CA', 'CLIENT', 'STAFF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('TODO', 'NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'COMPLETED', 'CANCELLED', 'ON_HOLD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE',
    'INVOICE_SENT', 'INVOICE_GENERATED', 'INVOICE_PAID', 'INVOICE_OVERDUE',
    'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYMENT_REMINDER', 'PAYMENT_DUE',
    'DOCUMENT_SHARED', 'DOCUMENT_READY',
    'APPOINTMENT_BOOKED', 'APPOINTMENT_REMINDER', 'MESSAGE_RECEIVED', 'MESSAGE',
    'FILING_DEADLINE', 'CA_APPROVED', 'SYSTEM_ANNOUNCEMENT', 'SYSTEM', 'CUSTOM', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'OFFICE_SUPPLIES', 'TRAVEL', 'MEALS', 'SOFTWARE', 'HARDWARE',
    'MARKETING', 'LEGAL', 'UTILITIES', 'RENT', 'SALARIES',
    'PROFESSIONAL_FEES', 'TAXES', 'INSURANCE',
    'CONSULTATION', 'OPERATIONS', 'EQUIPMENT', 'CLIENT_SERVICE', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'NOT_STARTED';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SYSTEM';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'INVOICE_GENERATED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PAYMENT_REMINDER';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'MESSAGE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DOCUMENT_READY';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PAYMENT_DUE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'CUSTOM';
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'CONSULTATION';
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'OPERATIONS';
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'EQUIPMENT';
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'CLIENT_SERVICE';

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
  organization_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON public.profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

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

CREATE OR REPLACE FUNCTION public.guard_sensitive_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin_user() THEN
    NEW.role := OLD.role;
    NEW.is_verified := OLD.is_verified;
    NEW.is_active := OLD.is_active;
    IF OLD.organization_id IS NOT NULL THEN
      NEW.organization_id := OLD.organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_guard_sensitive ON public.profiles;
CREATE TRIGGER tr_profiles_guard_sensitive
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_sensitive_profile_columns();

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
  CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
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
  CREATE TYPE subscription_plan AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIALING');
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
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  avatar_url TEXT,
  role user_role DEFAULT 'CLIENT'::user_role,
  status user_status DEFAULT 'PENDING_VERIFICATION'::user_status,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  two_factor_secret_temp TEXT,
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
  organization_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

CREATE OR REPLACE FUNCTION public.guard_sensitive_user_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin_user() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.email_verified := OLD.email_verified;
    NEW.email_verified_at := OLD.email_verified_at;
    IF OLD.organization_id IS NOT NULL THEN
      NEW.organization_id := OLD.organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_users_guard_sensitive ON public.users;
CREATE TRIGGER tr_users_guard_sensitive
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_sensitive_user_columns();

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
  hourly_rate DECIMAL(10, 2),
  avg_response_time INTEGER DEFAULT 24,
  availability_status TEXT DEFAULT 'available',
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
  first_name TEXT,
  last_name TEXT,
  pan_number TEXT UNIQUE,
  aadhaar_number TEXT,
  tan_number TEXT,
  date_of_birth DATE,
  business_name TEXT,
  business_type TEXT,
  gstin TEXT,
  gst_number TEXT,
  industry TEXT,
  annual_turnover DECIMAL(15, 2),
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients Table (Unified clients entity for firms, CAs, and client portal)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  assigned_ca_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  portal_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_type TEXT DEFAULT 'individual',
  full_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  alternate_phone TEXT,
  pan TEXT,
  aadhaar TEXT,
  gstin TEXT,
  tan TEXT,
  cin TEXT,
  date_of_birth DATE,
  date_of_incorporation DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'direct',
  risk_level TEXT DEFAULT 'low',
  portal_access BOOLEAN DEFAULT FALSE,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
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
  connected_at TIMESTAMPTZ DEFAULT NOW(),
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

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  type TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TASK & CASE MANAGEMENT TABLES
-- ============================================================================

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  ca_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT,
  financial_year TEXT,
  billable BOOLEAN DEFAULT FALSE,
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
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT,
  content TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID,
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
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  resolution_date DATE,
  monetary_value DECIMAL(15, 2),
  final_amount DECIMAL(15, 2),
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
  organization_id UUID,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL,
  is_billable BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  amount DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  work_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DOCUMENT MANAGEMENT & DIGITAL SIGNATURES
-- ============================================================================

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ca_id UUID REFERENCES public.users(id),
  client_id UUID,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  name TEXT,
  file_name TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT,
  file_type TEXT,
  mime_type TEXT,
  file_size INTEGER,
  size INTEGER,
  file_url TEXT DEFAULT '',
  document_type TEXT,
  category TEXT,
  financial_year TEXT,
  expiry_date DATE,
  folder TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  description TEXT,
  is_shared_with_ca BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared_with_client BOOLEAN DEFAULT FALSE,
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
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_code_hash TEXT,
  otp_expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Uploads Tracking
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bucket TEXT DEFAULT 'uploads',
  path TEXT DEFAULT '',
  file_path TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  file_size BIGINT,
  purpose TEXT DEFAULT 'document',
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. FINANCIAL, INVOICING & SUBSCRIPTION TABLES
-- ============================================================================

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  ca_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_id UUID,
  invoice_number TEXT NOT NULL UNIQUE DEFAULT ('INV-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  description TEXT,
  invoice_date DATE DEFAULT CURRENT_DATE,
  issue_date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(15, 2) DEFAULT 0.00,
  tax_percentage DECIMAL(5, 2) DEFAULT 0.00,
  tax_amount DECIMAL(15, 2) DEFAULT 0.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(15, 2) DEFAULT 0.00,
  balance_due DECIMAL(15, 2) DEFAULT 0.00,
  status invoice_status DEFAULT 'DRAFT'::invoice_status,
  payment_terms TEXT DEFAULT 'net_15',
  notes TEXT,
  gst_number TEXT,
  gst_rate DECIMAL(5, 2),
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  client_email TEXT,
  client_name TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items & Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  amount DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  ca_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status payment_status DEFAULT 'PENDING'::payment_status,
  gateway payment_gateway DEFAULT 'RAZORPAY'::payment_gateway,
  gateway_transaction_id TEXT UNIQUE,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  vendor TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  category expense_category NOT NULL,
  expense_date DATE,
  payment_method TEXT,
  is_billable BOOLEAN DEFAULT FALSE,
  reimbursable BOOLEAN DEFAULT FALSE,
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
  plan_type TEXT,
  billing_cycle TEXT DEFAULT 'monthly',
  status subscription_status DEFAULT 'ACTIVE'::subscription_status,
  razorpay_subscription_id TEXT,
  starts_at TIMESTAMPTZ,
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
  organization_id UUID,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  filing_type filing_type NOT NULL,
  financial_year TEXT NOT NULL,
  assessment_year TEXT,
  filing_period TEXT,
  status filing_status DEFAULT 'NOT_STARTED'::filing_status,
  submission_date DATE,
  acknowledgment_number TEXT UNIQUE,
  tax_payable DECIMAL(15, 2) DEFAULT 0,
  refund_due DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
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
  financial_year_from TEXT,
  financial_year_to TEXT,
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
  ca_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.tax_form_templates(id) ON DELETE SET NULL,
  form_code TEXT NOT NULL,
  form_name TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  form_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  completion_percentage INTEGER DEFAULT 0,
  missing_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Items
CREATE TABLE IF NOT EXISTS public.compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
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
  client_id UUID NOT NULL,
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
  financial_year TEXT,
  due_date DATE NOT NULL,
  applicable_to TEXT DEFAULT 'all',
  description TEXT,
  penalty_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Deadlines (supports both master rules & client deadlines)
CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  title TEXT,
  compliance_type TEXT,
  deadline_type TEXT,
  period_type TEXT,
  day_of_month INTEGER,
  month_of_year INTEGER,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  client_id UUID,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  ca_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  is_automated BOOLEAN DEFAULT FALSE,
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
  completed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  client_id UUID NOT NULL,
  ca_id UUID REFERENCES public.users(id),
  compliance_type TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  assessment_year TEXT,
  period_start DATE,
  period_end DATE,
  due_date DATE,
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
  organization_id UUID,
  ca_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_id UUID,
  type appointment_type DEFAULT 'VIDEO_CALL'::appointment_type,
  appointment_type TEXT,
  title TEXT,
  description TEXT,
  status appointment_status DEFAULT 'PENDING'::appointment_status,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  livekit_room_name TEXT,
  meeting_link TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  ca_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID,
  type TEXT DEFAULT 'direct',
  title TEXT,
  participant_ids UUID[] NOT NULL DEFAULT '{}',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

UPDATE public.conversations
SET participant_ids = ARRAY_REMOVE(ARRAY[ca_id, client_id], NULL)
WHERE cardinality(participant_ids) = 0;

CREATE OR REPLACE FUNCTION public.sync_conversation_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ca_user UUID;
  client_user UUID;
  derived_ca UUID;
  derived_portal UUID;
BEGIN
  IF cardinality(NEW.participant_ids) < 2 AND NEW.client_id IS NOT NULL THEN
    SELECT c.assigned_ca_id, COALESCE(c.portal_user_id, NEW.client_id)
    INTO derived_ca, derived_portal
    FROM public.clients c
    WHERE c.id = NEW.client_id;

    derived_ca := COALESCE(NEW.ca_id, derived_ca, auth.uid());
    derived_portal := COALESCE(derived_portal, NEW.client_id);

    IF derived_ca IS NOT NULL AND derived_portal IS NOT NULL AND derived_ca <> derived_portal THEN
      NEW.participant_ids := ARRAY[derived_ca, derived_portal];
    END IF;
  END IF;

  IF cardinality(NEW.participant_ids) < 2 AND NEW.ca_id IS NOT NULL AND NEW.client_id IS NOT NULL THEN
    NEW.participant_ids := ARRAY[NEW.ca_id, NEW.client_id];
  END IF;

  IF cardinality(NEW.participant_ids) < 2 THEN
    RAISE EXCEPTION 'A conversation requires at least two participants';
  END IF;

  SELECT id INTO ca_user
  FROM public.users
  WHERE id = ANY(NEW.participant_ids) AND role IN ('CA', 'STAFF')
  ORDER BY array_position(NEW.participant_ids, id)
  LIMIT 1;

  SELECT id INTO client_user
  FROM public.users
  WHERE id = ANY(NEW.participant_ids) AND id <> COALESCE(ca_user, uuid_nil())
  ORDER BY array_position(NEW.participant_ids, id)
  LIMIT 1;

  NEW.ca_id := COALESCE(ca_user, NEW.ca_id, NEW.participant_ids[1]);
  NEW.client_id := COALESCE(NEW.client_id, client_user, NEW.participant_ids[2]);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_participants_trigger ON public.conversations;
CREATE TRIGGER sync_conversation_participants_trigger
  BEFORE INSERT OR UPDATE OF participant_ids ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_conversation_participants();

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
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  message_type message_type DEFAULT 'TEXT'::message_type,
  content TEXT NOT NULL,
  reactions JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT FALSE,
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
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  channel TEXT DEFAULT 'in_app',
  metadata JSONB DEFAULT '{}'::jsonb,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation dismissals
CREATE TABLE IF NOT EXISTS public.recommendation_dismissals (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_dismissals_user_id
  ON public.recommendation_dismissals(user_id);

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
  client_id UUID NOT NULL,
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
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority INTEGER DEFAULT 2,
  priority_label TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id),
  admin_response TEXT,
  responded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CA Engagement Requests (Hire / Change CA Workflows)
CREATE TABLE IF NOT EXISTS public.ca_engagement_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_record_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL DEFAULT 'hire',
  title TEXT NOT NULL,
  message TEXT,
  service_category TEXT DEFAULT 'general',
  proposed_budget DECIMAL(12, 2),
  financial_year TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  response_notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CA Fee Proposals & Engagement Letters
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  title TEXT NOT NULL,
  scope TEXT,
  retainer_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  billing_frequency TEXT DEFAULT 'annual',
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until DATE,
  esignature_request_id UUID REFERENCES public.esignature_requests(id) ON DELETE SET NULL,
  signed_at TIMESTAMPTZ,
  document_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL DEFAULT 'upi',
  label TEXT NOT NULL,
  upi_id TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  bank_name TEXT,
  account_last4 TEXT,
  ifsc TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public Contact & Sales Inquiries
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_type TEXT NOT NULL DEFAULT 'contact',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  team_size TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
-- 10. COMPATIBILITY VIEWS & AUTHORIZATION HELPERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_client_owner_or_ca(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_client_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF auth.role() = 'service_role' OR public.is_admin_user() THEN
    RETURN TRUE;
  END IF;

  IF target_client_id = auth.uid() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.clients c
    WHERE c.id = target_client_id
      AND (
        c.assigned_ca_id = auth.uid()
        OR c.portal_user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.ca_firm_members fm
          WHERE fm.user_id = auth.uid()
            AND fm.firm_id = c.organization_id
            AND fm.is_active = TRUE
        )
      )
  ) OR EXISTS (
    SELECT 1
    FROM public.ca_client_relationships r
    WHERE r.client_id = target_client_id
      AND r.ca_id = auth.uid()
      AND r.status = 'active'
  );
END;
$$;

DROP VIEW IF EXISTS public.public_ca_profiles;
CREATE VIEW public.public_ca_profiles AS
SELECT
  cp.user_id,
  u.name AS full_name,
  u.avatar_url,
  cp.firm_name,
  cp.designation,
  cp.bio,
  cp.years_of_experience,
  cp.specializations,
  cp.languages,
  cp.status,
  cp.city,
  cp.state,
  cp.country,
  cp.website_url,
  cp.linkedin_url,
  cp.consultation_fee,
  cp.hourly_rate,
  cp.accepts_online_payment,
  cp.slug,
  cp.total_clients,
  cp.average_rating,
  cp.review_count,
  COALESCE(cp.avg_response_time, 24) AS avg_response_time,
  (cp.icai_membership_number IS NOT NULL) AS icai_verified,
  cp.availability_status,
  cp.signature_url,
  cp.letterhead_url,
  cp.created_at,
  cp.updated_at
FROM public.ca_profiles cp
JOIN public.users u ON u.id = cp.user_id
WHERE cp.public_profile = TRUE AND cp.status = 'APPROVED';

GRANT SELECT ON public.public_ca_profiles TO anon, authenticated;

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
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_ca_id ON public.clients(assigned_ca_id);
CREATE INDEX IF NOT EXISTS idx_clients_portal_user_id ON public.clients(portal_user_id);

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
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids ON public.conversations USING GIN (participant_ids);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempt_logs_email ON public.login_attempt_logs(email);

CREATE INDEX IF NOT EXISTS idx_ca_eng_req_ca ON public.ca_engagement_requests(ca_id);
CREATE INDEX IF NOT EXISTS idx_ca_eng_req_client ON public.ca_engagement_requests(client_user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_ca ON public.proposals(ca_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON public.time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.time_entries(user_id);

-- ============================================================================
-- 12. AUTH SIGNUP, COMPATIBILITY & UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  extracted_role user_role := 'CLIENT'::user_role;
  raw_app_role TEXT := COALESCE(NULLIF(UPPER(NEW.raw_app_meta_data->>'role'), ''), '');
  raw_user_role TEXT := COALESCE(NULLIF(UPPER(NEW.raw_user_meta_data->>'role'), ''), '');
  extracted_name TEXT;
  extracted_org_id UUID;
BEGIN
  extracted_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  IF raw_app_role IN ('SUPER_ADMIN', 'ADMIN') THEN
    extracted_role := 'SUPER_ADMIN'::user_role;
  ELSIF raw_app_role = 'STAFF' OR (raw_user_role = 'STAFF' AND NEW.raw_user_meta_data->>'organization_id' IS NOT NULL) THEN
    extracted_role := 'STAFF'::user_role;
  ELSIF raw_app_role = 'CA' OR raw_user_role = 'CA' THEN
    extracted_role := 'CA'::user_role;
  ELSE
    extracted_role := 'CLIENT'::user_role;
  END IF;

  BEGIN
    IF NULLIF(NEW.raw_user_meta_data->>'organization_id', '') IS NOT NULL THEN
      extracted_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    ELSIF extracted_role = 'CA'::user_role THEN
      extracted_org_id := uuid_generate_v4();
    END IF;
  EXCEPTION WHEN others THEN
    IF extracted_role = 'CA'::user_role THEN
      extracted_org_id := uuid_generate_v4();
    ELSE
      extracted_org_id := NULL;
    END IF;
  END;

  INSERT INTO public.profiles (
    id, email, full_name, role, avatar_url, is_verified, organization_id, metadata
  )
  VALUES (
    NEW.id,
    NEW.email,
    extracted_name,
    extracted_role,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    extracted_org_id,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified,
    organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
    metadata = COALESCE(EXCLUDED.metadata, public.profiles.metadata),
    updated_at = NOW();

  INSERT INTO public.users (
    id, email, name, phone, avatar_url, role, status, email_verified, email_verified_at, organization_id, metadata
  )
  VALUES (
    NEW.id,
    NEW.email,
    extracted_name,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    extracted_role,
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'ACTIVE'::user_status
      ELSE 'PENDING_VERIFICATION'::user_status
    END,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    NEW.email_confirmed_at,
    extracted_org_id,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
    role = EXCLUDED.role,
    email_verified = EXCLUDED.email_verified,
    email_verified_at = COALESCE(EXCLUDED.email_verified_at, public.users.email_verified_at),
    organization_id = COALESCE(EXCLUDED.organization_id, public.users.organization_id),
    metadata = COALESCE(EXCLUDED.metadata, public.users.metadata),
    updated_at = NOW();

  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, extracted_name)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

CREATE OR REPLACE FUNCTION public.sync_time_entry_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.work_date IS NULL THEN NEW.work_date := COALESCE(NEW.start_time::date, CURRENT_DATE); END IF;
  IF NEW.start_time IS NULL THEN NEW.start_time := NEW.work_date::timestamptz; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_time_entry_fields ON public.time_entries;
CREATE TRIGGER tr_sync_time_entry_fields BEFORE INSERT OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.sync_time_entry_fields();

CREATE OR REPLACE FUNCTION public.sync_document_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.uploaded_by := COALESCE(NEW.uploaded_by, NEW.user_id, auth.uid());
  NEW.user_id := COALESCE(NEW.user_id, NEW.uploaded_by);
  NEW.name := COALESCE(NEW.name, NEW.file_name);
  NEW.file_name := COALESCE(NEW.file_name, NEW.name, 'document');
  NEW.file_size := COALESCE(NEW.file_size, NEW.size, 0);
  NEW.size := COALESCE(NEW.size, NEW.file_size, 0);
  NEW.file_url := COALESCE(NULLIF(NEW.file_url, ''), NEW.file_path, '');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_document_fields ON public.documents;
CREATE TRIGGER tr_sync_document_fields BEFORE INSERT OR UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.sync_document_fields();

CREATE OR REPLACE FUNCTION public.sync_task_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.ca_id, auth.uid());
  NEW.ca_id := COALESCE(NEW.ca_id, NEW.created_by);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_task_fields ON public.tasks;
CREATE TRIGGER tr_sync_task_fields BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.sync_task_fields();

CREATE OR REPLACE FUNCTION public.sync_task_comment_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.author_id := COALESCE(NEW.author_id, NEW.user_id, auth.uid());
  NEW.user_id := COALESCE(NEW.user_id, NEW.author_id);
  NEW.content := COALESCE(NEW.content, NEW.comment, '');
  NEW.comment := COALESCE(NEW.comment, NEW.content, '');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_task_comment_fields ON public.task_comments;
CREATE TRIGGER tr_sync_task_comment_fields BEFORE INSERT OR UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.sync_task_comment_fields();

CREATE OR REPLACE FUNCTION public.sync_invoice_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.ca_id, auth.uid());
  NEW.ca_id := COALESCE(NEW.ca_id, NEW.created_by);
  NEW.invoice_number := COALESCE(NULLIF(NEW.invoice_number, ''), 'INV-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)));
  NEW.amount := COALESCE(NULLIF(NEW.amount, 0), NEW.subtotal, NEW.total_amount, 0);
  NEW.subtotal := COALESCE(NULLIF(NEW.subtotal, 0), NEW.amount, 0);
  NEW.total_amount := COALESCE(NULLIF(NEW.total_amount, 0), COALESCE(NEW.subtotal, 0) + COALESCE(NEW.tax_amount, 0) - COALESCE(NEW.discount_amount, 0), 0);
  IF NEW.balance_due IS NULL OR (TG_OP = 'INSERT' AND NEW.balance_due = 0 AND NEW.status <> 'PAID'::invoice_status) THEN
    NEW.balance_due := GREATEST(0, COALESCE(NEW.total_amount, 0) - COALESCE(NEW.paid_amount, 0));
  END IF;
  NEW.issued_at := COALESCE(NEW.issued_at, NEW.issue_date::timestamptz, NEW.invoice_date::timestamptz, NOW());
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_invoice_fields ON public.invoices;
CREATE TRIGGER tr_sync_invoice_fields BEFORE INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_fields();

CREATE OR REPLACE FUNCTION public.sync_payment_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inv_ca UUID;
  inv_client UUID;
BEGIN
  IF NEW.invoice_id IS NOT NULL AND (NEW.ca_id IS NULL OR NEW.client_id IS NULL) THEN
    SELECT ca_id, client_id INTO inv_ca, inv_client FROM public.invoices WHERE id = NEW.invoice_id;
    NEW.ca_id := COALESCE(NEW.ca_id, inv_ca);
    NEW.client_id := COALESCE(NEW.client_id, inv_client);
  END IF;
  NEW.gateway_order_id := COALESCE(NEW.gateway_order_id, NEW.razorpay_order_id);
  NEW.razorpay_order_id := COALESCE(NEW.razorpay_order_id, NEW.gateway_order_id);
  NEW.gateway_payment_id := COALESCE(NEW.gateway_payment_id, NEW.razorpay_payment_id);
  NEW.razorpay_payment_id := COALESCE(NEW.razorpay_payment_id, NEW.gateway_payment_id);
  IF NEW.status IN ('SUCCESS'::payment_status, 'COMPLETED'::payment_status) AND NEW.paid_at IS NULL THEN
    NEW.paid_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_payment_fields ON public.payments;
CREATE TRIGGER tr_sync_payment_fields BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.sync_payment_fields();

CREATE OR REPLACE FUNCTION public.sync_appointment_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.ca_id, auth.uid());
  NEW.ca_id := COALESCE(NEW.ca_id, NEW.created_by);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_appointment_fields ON public.appointments;
CREATE TRIGGER tr_sync_appointment_fields BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_fields();

CREATE OR REPLACE FUNCTION public.sync_notification_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.read := COALESCE(NEW.read, NEW.is_read, FALSE);
    NEW.is_read := NEW.read;
  ELSE
    IF NEW.is_read IS DISTINCT FROM OLD.is_read THEN NEW.read := NEW.is_read;
    ELSIF NEW.read IS DISTINCT FROM OLD.read THEN NEW.is_read := NEW.read;
    END IF;
  END IF;
  IF (NEW.read OR NEW.is_read) AND NEW.read_at IS NULL THEN NEW.read_at := NOW(); END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_notification_fields ON public.notifications;
CREATE TRIGGER tr_sync_notification_fields BEFORE INSERT OR UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.sync_notification_fields();

CREATE OR REPLACE FUNCTION public.sync_support_ticket_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.user_id, auth.uid());
  NEW.user_id := COALESCE(NEW.user_id, NEW.created_by);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_support_ticket_fields ON public.support_tickets;
CREATE TRIGGER tr_sync_support_ticket_fields BEFORE INSERT OR UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.sync_support_ticket_fields();

CREATE OR REPLACE FUNCTION public.sync_file_upload_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.path := COALESCE(NULLIF(NEW.path, ''), NEW.file_path, '');
  NEW.file_path := COALESCE(NULLIF(NEW.file_path, ''), NEW.path, '');
  NEW.size_bytes := COALESCE(NEW.size_bytes, NEW.file_size, 0);
  NEW.file_size := COALESCE(NEW.file_size, NEW.size_bytes, 0);
  NEW.bucket := COALESCE(NULLIF(NEW.bucket, ''), 'uploads');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_sync_file_upload_fields ON public.file_uploads;
CREATE TRIGGER tr_sync_file_upload_fields BEFORE INSERT OR UPDATE ON public.file_uploads FOR EACH ROW EXECUTE FUNCTION public.sync_file_upload_fields();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_profiles_updated_at ON public.ca_profiles;
CREATE TRIGGER tr_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER tr_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_firms_updated_at ON public.ca_firms;
CREATE TRIGGER tr_ca_firms_updated_at BEFORE UPDATE ON public.ca_firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_firm_members_updated_at ON public.ca_firm_members;
CREATE TRIGGER tr_ca_firm_members_updated_at BEFORE UPDATE ON public.ca_firm_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_client_rel_updated_at ON public.ca_client_relationships;
CREATE TRIGGER tr_ca_client_rel_updated_at BEFORE UPDATE ON public.ca_client_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_services_updated_at ON public.ca_services;
CREATE TRIGGER tr_ca_services_updated_at BEFORE UPDATE ON public.ca_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER tr_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_user_presence_updated_at ON public.user_presence;
CREATE TRIGGER tr_user_presence_updated_at BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_settings_updated_at ON public.settings;
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_onboarding_updated_at ON public.onboarding;
CREATE TRIGGER tr_onboarding_updated_at BEFORE UPDATE ON public.onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_tasks_updated_at ON public.tasks;
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_task_comments_updated_at ON public.task_comments;
CREATE TRIGGER tr_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_cases_updated_at ON public.cases;
CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER tr_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_documents_updated_at ON public.documents;
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_esignature_requests_updated_at ON public.esignature_requests;
CREATE TRIGGER tr_esignature_requests_updated_at BEFORE UPDATE ON public.esignature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_invoices_updated_at ON public.invoices;
CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_payments_updated_at ON public.payments;
CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_expenses_updated_at ON public.expenses;
CREATE TRIGGER tr_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_tax_filings_updated_at ON public.tax_filings;
CREATE TRIGGER tr_tax_filings_updated_at BEFORE UPDATE ON public.tax_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_tax_form_templates_updated_at ON public.tax_form_templates;
CREATE TRIGGER tr_tax_form_templates_updated_at BEFORE UPDATE ON public.tax_form_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_client_tax_forms_updated_at ON public.client_tax_forms;
CREATE TRIGGER tr_client_tax_forms_updated_at BEFORE UPDATE ON public.client_tax_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_compliance_items_updated_at ON public.compliance_items;
CREATE TRIGGER tr_compliance_items_updated_at BEFORE UPDATE ON public.compliance_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_compliance_filings_updated_at ON public.compliance_filings;
CREATE TRIGGER tr_compliance_filings_updated_at BEFORE UPDATE ON public.compliance_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_appointments_updated_at ON public.appointments;
CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_conversations_updated_at ON public.conversations;
CREATE TRIGGER tr_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_messages_updated_at ON public.messages;
CREATE TRIGGER tr_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_notifications_updated_at ON public.notifications;
CREATE TRIGGER tr_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_reviews_updated_at ON public.reviews;
CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_notes_updated_at ON public.notes;
CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_client_notes_updated_at ON public.client_notes;
CREATE TRIGGER tr_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER tr_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_ca_engagement_requests_updated_at ON public.ca_engagement_requests;
CREATE TRIGGER tr_ca_engagement_requests_updated_at BEFORE UPDATE ON public.ca_engagement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_proposals_updated_at ON public.proposals;
CREATE TRIGGER tr_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER tr_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS tr_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER tr_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tax_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_dismissals ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.ca_engagement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_select ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin_user());
CREATE POLICY users_self_update ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin_user());
CREATE POLICY users_admin_all ON public.users FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY user_profiles_all ON public.user_profiles FOR ALL USING (auth.uid() = user_id OR public.is_admin_user());
CREATE POLICY ca_profiles_private_select ON public.ca_profiles FOR SELECT USING (auth.uid() = user_id OR public.is_admin_user());
CREATE POLICY ca_profiles_self_insert ON public.ca_profiles FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin_user());
CREATE POLICY ca_profiles_self_update ON public.ca_profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_user()) WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY client_profiles_self ON public.client_profiles FOR ALL USING (auth.uid() = user_id OR auth.uid() = ca_id OR public.is_admin_user());
CREATE POLICY clients_access ON public.clients FOR ALL
  USING (
    auth.uid() = assigned_ca_id OR auth.uid() = portal_user_id OR public.is_admin_user()
    OR EXISTS (SELECT 1 FROM public.ca_firm_members WHERE user_id = auth.uid() AND firm_id = clients.organization_id)
  )
  WITH CHECK (
    auth.uid() = assigned_ca_id OR public.is_admin_user()
    OR EXISTS (SELECT 1 FROM public.ca_firm_members WHERE user_id = auth.uid() AND firm_id = clients.organization_id)
  );
CREATE POLICY tags_access ON public.tags FOR ALL USING (auth.role() IN ('authenticated', 'service_role') OR public.is_admin_user());
CREATE POLICY compliance_deadlines_read ON public.compliance_deadlines FOR SELECT USING (client_id IS NULL OR ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY compliance_deadlines_write ON public.compliance_deadlines FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY ca_firms_access ON public.ca_firms FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY ca_firm_members_access ON public.ca_firm_members FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.ca_firms f WHERE f.id = ca_firm_members.firm_id AND f.ca_id = auth.uid()) OR public.is_admin_user())
  WITH CHECK (EXISTS (SELECT 1 FROM public.ca_firms f WHERE f.id = ca_firm_members.firm_id AND f.ca_id = auth.uid()) OR public.is_admin_user());
CREATE POLICY ca_client_rel_access ON public.ca_client_relationships FOR ALL USING (ca_id = auth.uid() OR client_id = auth.uid() OR public.is_admin_user());
CREATE POLICY ca_services_read ON public.ca_services FOR SELECT USING (TRUE);
CREATE POLICY ca_services_write ON public.ca_services FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY ca_specializations_read ON public.ca_specializations FOR SELECT USING (TRUE);
CREATE POLICY ca_specializations_write ON public.ca_specializations FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());

CREATE POLICY tasks_access ON public.tasks FOR ALL USING (ca_id = auth.uid() OR created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY task_comments_access ON public.task_comments FOR ALL
  USING (author_id = auth.uid() OR user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND (t.ca_id = auth.uid() OR t.assigned_to = auth.uid() OR t.created_by = auth.uid() OR public.is_client_owner_or_ca(t.client_id))) OR public.is_admin_user())
  WITH CHECK (author_id = auth.uid() OR user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY cases_access ON public.cases FOR ALL USING (ca_id = auth.uid() OR assigned_to = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY case_activities_access ON public.case_activities FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_activities.case_id AND (c.ca_id = auth.uid() OR c.assigned_to = auth.uid() OR public.is_client_owner_or_ca(c.client_id))) OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY time_entries_access ON public.time_entries FOR ALL USING (user_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY documents_access ON public.documents FOR ALL USING (user_id = auth.uid() OR uploaded_by = auth.uid() OR ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY esignature_access ON public.esignature_requests FOR ALL USING (requester_id = auth.uid() OR signer_id = auth.uid() OR public.is_admin_user());
CREATE POLICY file_uploads_access ON public.file_uploads FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY invoices_access ON public.invoices FOR ALL USING (ca_id = auth.uid() OR created_by = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY invoice_items_access ON public.invoice_items FOR ALL USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND (i.ca_id = auth.uid() OR i.created_by = auth.uid() OR public.is_client_owner_or_ca(i.client_id))) OR public.is_admin_user());
CREATE POLICY invoice_line_items_access ON public.invoice_line_items FOR ALL USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_line_items.invoice_id AND (i.ca_id = auth.uid() OR i.created_by = auth.uid() OR public.is_client_owner_or_ca(i.client_id))) OR public.is_admin_user());
CREATE POLICY payments_access ON public.payments FOR ALL USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY expenses_access ON public.expenses FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY subscriptions_access ON public.subscriptions FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY tax_filings_access ON public.tax_filings FOR ALL USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY tax_form_templates_read ON public.tax_form_templates FOR SELECT USING (auth.role() IN ('authenticated', 'service_role') OR public.is_admin_user());
CREATE POLICY tax_form_templates_admin ON public.tax_form_templates FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY client_tax_forms_access ON public.client_tax_forms FOR ALL USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY compliance_items_access ON public.compliance_items FOR ALL USING (ca_id = auth.uid() OR assigned_to = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY compliance_filings_access ON public.compliance_filings FOR ALL USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY compliance_calendar_read ON public.compliance_calendar FOR SELECT USING (TRUE);
CREATE POLICY compliance_calendar_admin ON public.compliance_calendar FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY compliance_records_access ON public.compliance_records FOR ALL USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());
CREATE POLICY compliance_automation_rules_access ON public.compliance_automation_rules FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY appointments_access ON public.appointments FOR ALL USING (ca_id = auth.uid() OR created_by = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());

CREATE POLICY conversations_access ON public.conversations FOR ALL
  USING (auth.uid() = ANY(participant_ids) OR ca_id = auth.uid() OR client_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (auth.uid() = ANY(participant_ids) OR ca_id = auth.uid() OR client_id = auth.uid() OR public.is_admin_user());
CREATE POLICY conversation_participants_access ON public.conversation_participants FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_participants.conversation_id AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())) OR public.is_admin_user());
CREATE POLICY messages_access ON public.messages FOR ALL USING (
  sender_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (auth.uid() = ANY(participant_ids) OR ca_id = auth.uid() OR client_id = auth.uid())) OR public.is_admin_user()
);
CREATE POLICY message_read_receipts_access ON public.message_read_receipts FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.messages m JOIN public.conversations c ON c.id = m.conversation_id WHERE m.id = message_read_receipts.message_id AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())) OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY typing_indicators_access ON public.typing_indicators FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = typing_indicators.conversation_id AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())) OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY notifications_access ON public.notifications FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY recommendation_dismissals_access ON public.recommendation_dismissals FOR ALL
  USING (user_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY notification_prefs_access ON public.notification_preferences FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY security_alerts_access ON public.security_alerts FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY settings_access ON public.settings FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY user_sessions_access ON public.user_sessions FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY user_presence_read ON public.user_presence FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY user_presence_write ON public.user_presence FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY onboarding_access ON public.onboarding FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY onboarding_data_access ON public.onboarding_data FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY notes_access ON public.notes FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY client_notes_access ON public.client_notes FOR ALL USING (ca_id = auth.uid() OR author_id = auth.uid() OR (NOT is_private AND public.is_client_owner_or_ca(client_id)) OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR author_id = auth.uid() OR public.is_admin_user());
CREATE POLICY team_members_access ON public.team_members FOR ALL USING (ca_id = auth.uid() OR member_id = auth.uid() OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY activity_logs_select ON public.activity_logs FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY activity_logs_insert ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY activity_feed_access ON public.activity_feed FOR ALL USING (user_id = auth.uid() OR actor_id = auth.uid() OR public.is_admin_user());
CREATE POLICY reviews_read ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY reviews_write ON public.reviews FOR ALL USING (client_id = auth.uid() OR public.is_admin_user()) WITH CHECK (client_id = auth.uid() OR public.is_admin_user());
CREATE POLICY blog_posts_read ON public.blog_posts FOR SELECT USING (published = TRUE OR user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY blog_posts_write ON public.blog_posts FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY support_tickets_access ON public.support_tickets FOR ALL USING (user_id = auth.uid() OR created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_admin_user());
CREATE POLICY feature_flags_read ON public.feature_flags FOR SELECT USING (TRUE);
CREATE POLICY feature_flags_admin ON public.feature_flags FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT USING (public.is_admin_user());
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY system_logs_read ON public.system_logs FOR SELECT USING (public.is_admin_user());
CREATE POLICY system_logs_insert ON public.system_logs FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY system_settings_read ON public.system_settings FOR SELECT USING (TRUE);
CREATE POLICY system_settings_admin ON public.system_settings FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY maintenance_subscribers_insert ON public.maintenance_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY verification_tokens_service ON public.verification_tokens FOR ALL USING (public.is_admin_user());
CREATE POLICY login_attempt_logs_admin ON public.login_attempt_logs FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY password_change_logs_admin ON public.password_change_logs FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY ca_engagement_requests_access ON public.ca_engagement_requests FOR ALL USING (client_user_id = auth.uid() OR ca_id = auth.uid() OR public.is_admin_user()) WITH CHECK (client_user_id = auth.uid() OR ca_id = auth.uid() OR public.is_admin_user());
CREATE POLICY proposals_access ON public.proposals FOR ALL USING (ca_id = auth.uid() OR client_user_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR client_user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY payment_methods_access ON public.payment_methods FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY contact_inquiries_insert ON public.contact_inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY contact_inquiries_admin ON public.contact_inquiries FOR SELECT USING (public.is_admin_user());
CREATE POLICY contact_inquiries_admin_write ON public.contact_inquiries FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- ============================================================================
-- 14. REAL-TIME REPLICATION CONFIGURATION
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'user_profiles', 'ca_profiles', 'client_profiles', 'user_presence',
    'tasks', 'task_comments', 'cases', 'documents', 'esignature_requests',
    'notifications', 'messages', 'conversations', 'message_read_receipts',
    'typing_indicators', 'appointments', 'invoices', 'payments',
    'compliance_items', 'compliance_records', 'compliance_deadlines',
    'security_alerts', 'ca_firms', 'clients', 'tags',
    'proposals', 'ca_engagement_requests', 'time_entries', 'support_tickets'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END;
$$;

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
  ('chat-files', 'chat-files', false, 52428800, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/zip']),
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('uploads', 'uploads', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'])
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
DROP POLICY IF EXISTS "Users Manage Own Documents" ON storage.objects;
CREATE POLICY "Users Manage Own Documents" ON storage.objects
  FOR ALL
  USING (
    bucket_id IN ('documents', 'invoice-pdfs', 'receipts', 'chat-files', 'verification-documents', 'uploads')
    AND (
      auth.role() = 'service_role'
      OR public.is_admin_user()
      OR (
        auth.role() = 'authenticated'
        AND (
          (storage.foldername(name))[1] = auth.uid()::text
          OR EXISTS (
            SELECT 1
            FROM public.documents d
            WHERE (d.file_path = name OR d.file_url LIKE '%' || name)
              AND (d.ca_id = auth.uid() OR d.user_id = auth.uid() OR d.uploaded_by = auth.uid() OR public.is_client_owner_or_ca(d.client_id))
          )
        )
      )
    )
  )
  WITH CHECK (
    bucket_id IN ('documents', 'invoice-pdfs', 'receipts', 'chat-files', 'verification-documents', 'uploads')
    AND (
      auth.role() = 'service_role'
      OR public.is_admin_user()
      OR (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    )
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
