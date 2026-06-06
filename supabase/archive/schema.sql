-- ==========================================
-- CA PRO CONNECT - COMPLETE DATABASE SCHEMA
-- Production-Ready Supabase Schema
-- ==========================================

-- ======================
-- 0. EXTENSIONS
-- ======================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================
-- 1. USERS TABLE (Core Identity)
-- ======================
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  role TEXT NOT NULL CHECK (role IN ('ca', 'client', 'firm', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated', 'pending_onboarding')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 2. CA PROFILES (Chartered Accountants)
-- ======================
DROP TABLE IF EXISTS public.ca_profiles CASCADE;
CREATE TABLE public.ca_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  tagline TEXT,
  
  -- Professional Details
  icai_membership_number TEXT UNIQUE,
  icai_registration_date DATE,
  firm_name TEXT,
  designation TEXT,
  years_of_experience INTEGER DEFAULT 0,
  
  -- Verification
  verification_status TEXT DEFAULT 'unverified' CHECK (
    verification_status IN ('unverified', 'pending', 'under_review', 'verified', 'rejected')
  ),
  verification_documents JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  
  -- Contact & Location
  office_address JSONB,
  service_locations TEXT[],
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  consultation_modes TEXT[] DEFAULT '{online}',
  
  -- Stats (cached for performance)
  total_clients INTEGER DEFAULT 0,
  active_cases INTEGER DEFAULT 0,
  completed_cases INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Premium Features
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  
  -- SEO & Discovery
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 3. CLIENT PROFILES
-- ======================
DROP TABLE IF EXISTS public.client_profiles CASCADE;
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Client Type
  client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'business')),
  
  -- Individual Details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  pan_number TEXT,
  
  -- Business Details (if business client)
  business_name TEXT,
  business_type TEXT,
  gst_number TEXT,
  cin_number TEXT,
  incorporation_date DATE,
  
  -- Contact
  avatar_url TEXT,
  phone_alternate TEXT,
  address JSONB,
  preferred_language TEXT DEFAULT 'English',
  
  -- Stats
  total_cases INTEGER DEFAULT 0,
  active_cases INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 4. CA SERVICES
-- ======================
DROP TABLE IF EXISTS public.ca_services CASCADE;
CREATE TABLE public.ca_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  
  service_type TEXT NOT NULL CHECK (service_type IN (
    'ITR_FILING', 'GST_REGISTRATION', 'GST_FILING', 'TDS_COMPLIANCE', 
    'AUDIT', 'ROC_COMPLIANCE', 'ACCOUNTING', 'TAX_PLANNING', 
    'FINANCIAL_ADVISORY', 'STARTUP_COMPLIANCE', 'CONSULTATION', 'OTHER'
  )),
  
  sub_category TEXT,
  description TEXT,
  
  -- Pricing
  pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'quote')),
  base_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Turnaround
  estimated_days INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 5. CA SPECIALIZATIONS
-- ======================
DROP TABLE IF EXISTS public.ca_specializations CASCADE;
CREATE TABLE public.ca_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  specialization TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 6. CA INDUSTRIES
-- ======================
DROP TABLE IF EXISTS public.ca_industries CASCADE;
CREATE TABLE public.ca_industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  industry TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 7. CA AVAILABILITY
-- ======================
DROP TABLE IF EXISTS public.ca_availability CASCADE;
CREATE TABLE public.ca_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  
  specific_date DATE,
  
  is_available BOOLEAN DEFAULT true,
  slot_duration_minutes INTEGER DEFAULT 30,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 8. CA-CLIENT RELATIONSHIPS
-- ======================
DROP TABLE IF EXISTS public.ca_client_relationships CASCADE;
CREATE TABLE public.ca_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'terminated'
  )),
  
  requested_by UUID REFERENCES public.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  permissions JSONB DEFAULT '{"view_documents": true, "download_documents": false}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ca_id, client_id)
);

-- ======================
-- 9. CASES (Core Work Unit)
-- ======================
DROP TABLE IF EXISTS public.cases CASCADE;
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE RESTRICT NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE RESTRICT NOT NULL,
  relationship_id UUID REFERENCES public.ca_client_relationships(id),
  
  -- Case Details
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL CHECK (case_type IN (
    'ITR', 'GST_FILING', 'GST_REGISTRATION', 'TDS', 'AUDIT', 
    'ROC_COMPLIANCE', 'ACCOUNTING', 'TAX_PLANNING', 'CONSULTATION', 'OTHER'
  )),
  sub_type TEXT,
  
  -- Status & Priority
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'waiting_client', 'under_review', 
    'filed', 'completed', 'on_hold', 'cancelled'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timeline
  deadline TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  filed_at TIMESTAMPTZ,
  
  -- Financial
  estimated_fee DECIMAL(12,2),
  final_fee DECIMAL(12,2),
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'partially_paid', 'paid', 'refunded'
  )),
  
  -- Assignment (for firms)
  assigned_to UUID REFERENCES public.users(id),
  
  -- Metadata
  tags TEXT[],
  assessment_year TEXT,
  financial_year TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 10. CASE TASKS
-- ======================
DROP TABLE IF EXISTS public.case_tasks CASCADE;
CREATE TABLE public.case_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  
  assigned_to UUID REFERENCES public.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.users(id),
  
  position INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 11. CASE TIMELINE (Activity Log)
-- ======================
DROP TABLE IF EXISTS public.case_timeline CASCADE;
CREATE TABLE public.case_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'status_changed', 'comment_added', 'document_uploaded', 
    'task_completed', 'payment_received', 'filed', 'completed', 'assigned'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 12. DOCUMENTS
-- ======================
DROP TABLE IF EXISTS public.documents CASCADE;
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  uploaded_by UUID REFERENCES public.users(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  ca_id UUID REFERENCES public.ca_profiles(id),
  client_id UUID REFERENCES public.client_profiles(id),
  
  -- File Details
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  
  -- Classification
  document_type TEXT CHECK (document_type IN (
    'PAN_CARD', 'AADHAAR', 'BANK_STATEMENT', 'SALARY_SLIP', 
    'FORM_16', 'GST_CERTIFICATE', 'INVOICE', 'RECEIPT', 
    'ITR_ACKNOWLEDGEMENT', 'AUDIT_REPORT', 'CONTRACT', 'OTHER'
  )),
  
  -- AI-generated metadata
  ai_tags TEXT[],
  ai_extracted_data JSONB,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES public.documents(id),
  
  -- Access Control
  is_public BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  encrypted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 13. DOCUMENT PERMISSIONS
-- ======================
DROP TABLE IF EXISTS public.document_permissions CASCADE;
CREATE TABLE public.document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  can_view BOOLEAN DEFAULT false,
  can_download BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  
  granted_by UUID REFERENCES public.users(id),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(document_id, user_id)
);

-- ======================
-- 14. CONVERSATIONS
-- ======================
DROP TABLE IF EXISTS public.conversations CASCADE;
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  participant_ids UUID[] NOT NULL,
  
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  
  title TEXT,
  is_archived BOOLEAN DEFAULT false,
  
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 15. MESSAGES
-- ======================
DROP TABLE IF EXISTS public.messages CASCADE;
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'image')),
  content TEXT,
  
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ======================
-- 16. MESSAGE READ RECEIPTS
-- ======================
DROP TABLE IF EXISTS public.message_read_receipts CASCADE;
CREATE TABLE public.message_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(message_id, user_id)
);

-- ======================
-- 17. TYPING INDICATORS
-- ======================
DROP TABLE IF EXISTS public.typing_indicators CASCADE;
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, user_id)
);

-- ======================
-- 18. APPOINTMENTS
-- ======================
DROP TABLE IF EXISTS public.appointments CASCADE;
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  
  appointment_type TEXT DEFAULT 'consultation' CHECK (appointment_type IN (
    'consultation', 'follow_up', 'document_review', 'signing', 'call'
  )),
  mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'offline')),
  
  location TEXT,
  meeting_link TEXT,
  meeting_password TEXT,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show'
  )),
  
  title TEXT,
  notes TEXT,
  
  reminder_sent BOOLEAN DEFAULT false,
  recording_url TEXT,
  
  cancelled_by UUID REFERENCES public.users(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 19. PAYMENTS
-- ======================
DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL,
  
  payer_id UUID REFERENCES public.users(id) NOT NULL,
  payee_id UUID REFERENCES public.users(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  payment_gateway TEXT CHECK (payment_gateway IN ('razorpay', 'stripe', 'manual')),
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
  )),
  
  payment_type TEXT CHECK (payment_type IN ('consultation', 'case_fee', 'subscription', 'advance', 'other')),
  
  description TEXT,
  invoice_id UUID,
  
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  held_in_escrow BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 20. INVOICES
-- ======================
DROP TABLE IF EXISTS public.invoices CASCADE;
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  
  ca_id UUID REFERENCES public.ca_profiles(id) NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled'
  )),
  
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  line_items JSONB NOT NULL,
  
  notes TEXT,
  terms TEXT,
  
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 21. REVIEWS
-- ======================
DROP TABLE IF EXISTS public.reviews CASCADE;
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  
  title TEXT,
  review_text TEXT,
  
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  expertise_rating INTEGER CHECK (expertise_rating BETWEEN 1 AND 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  
  is_published BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  ca_response TEXT,
  ca_responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ca_id, client_id, case_id)
);

-- ======================
-- 22. NOTIFICATIONS
-- ======================
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL CHECK (type IN (
    'new_message', 'new_client_request', 'case_update', 'appointment_reminder',
    'payment_received', 'document_uploaded', 'review_received', 'deadline_approaching',
    'connection_accepted', 'connection_rejected', 'system'
  )),
  
  title TEXT NOT NULL,
  message TEXT,
  
  action_url TEXT,
  
  related_user_id UUID REFERENCES public.users(id),
  case_id UUID REFERENCES public.cases(id),
  conversation_id UUID REFERENCES public.conversations(id),
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 23. NOTIFICATION PREFERENCES
-- ======================
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  
  preferences JSONB DEFAULT '{
    "new_message": {"email": true, "sms": false, "push": true},
    "case_update": {"email": true, "sms": false, "push": true},
    "appointment_reminder": {"email": true, "sms": true, "push": true},
    "payment_received": {"email": true, "sms": false, "push": true}
  }',
  
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 24. SAVED CAs (Favorites)
-- ======================
DROP TABLE IF EXISTS public.saved_cas CASCADE;
CREATE TABLE public.saved_cas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, ca_id)
);

-- ======================
-- 25. SUBSCRIPTIONS
-- ======================
DROP TABLE IF EXISTS public.subscriptions CASCADE;
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'cancelled', 'expired', 'paused'
  )),
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  gateway_subscription_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 26. USER PRESENCE
-- ======================
DROP TABLE IF EXISTS public.user_presence CASCADE;
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  current_page TEXT,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- CA Profiles
CREATE INDEX IF NOT EXISTS idx_ca_profiles_user_id ON public.ca_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_verification ON public.ca_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_slug ON public.ca_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_premium ON public.ca_profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_available ON public.ca_profiles(is_available);

-- Client Profiles
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_ca_id ON public.cases(ca_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON public.cases(deadline);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_ca_id ON public.documents(ca_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_ca_id ON public.appointments(ca_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_payer ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_case ON public.payments(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- CA Client Relationships
CREATE INDEX IF NOT EXISTS idx_relationships_ca ON public.ca_client_relationships(ca_id);
CREATE INDEX IF NOT EXISTS idx_relationships_client ON public.ca_client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON public.ca_client_relationships(status);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- USERS
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- CA PROFILES (Public read for discovery)
CREATE POLICY "CA profiles are viewable by everyone" ON public.ca_profiles
  FOR SELECT USING (true);

CREATE POLICY "CAs can update own profile" ON public.ca_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "CAs can insert own profile" ON public.ca_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CLIENT PROFILES
CREATE POLICY "Clients can view own profile" ON public.client_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "CAs can view connected clients" ON public.client_profiles
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM public.ca_client_relationships
      WHERE ca_id = (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
      AND status = 'accepted'
    )
  );

CREATE POLICY "Clients can update own profile" ON public.client_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert own profile" ON public.client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CA SERVICES
CREATE POLICY "CA services are viewable by everyone" ON public.ca_services
  FOR SELECT USING (true);

CREATE POLICY "CAs can manage own services" ON public.ca_services
  FOR ALL USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

-- CA SPECIALIZATIONS
CREATE POLICY "CA specializations are viewable by everyone" ON public.ca_specializations
  FOR SELECT USING (true);

CREATE POLICY "CAs can manage own specializations" ON public.ca_specializations
  FOR ALL USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

-- CA AVAILABILITY
CREATE POLICY "CA availability viewable by authenticated" ON public.ca_availability
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "CAs can manage own availability" ON public.ca_availability
  FOR ALL USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

-- RELATIONSHIPS
CREATE POLICY "Users can view own relationships" ON public.ca_client_relationships
  FOR SELECT USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert relationships" ON public.ca_client_relationships
  FOR INSERT WITH CHECK (
    requested_by = auth.uid()
  );

CREATE POLICY "Users can update own relationships" ON public.ca_client_relationships
  FOR UPDATE USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

-- CASES
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "CAs can create cases" ON public.cases
  FOR INSERT WITH CHECK (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own cases" ON public.cases
  FOR UPDATE USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

-- CASE TASKS
CREATE POLICY "Users can view tasks for own cases" ON public.case_tasks
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.cases WHERE 
      ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
      OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "CAs can manage tasks" ON public.case_tasks
  FOR ALL USING (
    case_id IN (
      SELECT id FROM public.cases WHERE 
      ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    )
  );

-- CASE TIMELINE
CREATE POLICY "Users can view timeline for own cases" ON public.case_timeline
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.cases WHERE 
      ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
      OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert timeline events" ON public.case_timeline
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
  );

-- DOCUMENTS
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    OR case_id IN (
      SELECT id FROM public.cases WHERE 
      ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
      OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (uploaded_by = auth.uid());

-- CONVERSATIONS
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- MESSAGES
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- MESSAGE READ RECEIPTS
CREATE POLICY "Users can manage read receipts" ON public.message_read_receipts
  FOR ALL USING (user_id = auth.uid());

-- TYPING INDICATORS
CREATE POLICY "Users can manage typing indicators" ON public.typing_indicators
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view typing in own conversations" ON public.typing_indicators
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );

-- APPOINTMENTS
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

-- PAYMENTS
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (payer_id = auth.uid());

-- INVOICES
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "CAs can manage invoices" ON public.invoices
  FOR ALL USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

-- REVIEWS
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Clients can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "CAs can respond to reviews" ON public.reviews
  FOR UPDATE USING (
    ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
  );

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- NOTIFICATION PREFERENCES
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- SAVED CAS
CREATE POLICY "Users can manage saved CAs" ON public.saved_cas
  FOR ALL USING (
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  );

-- SUBSCRIPTIONS
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- USER PRESENCE
CREATE POLICY "Users can view presence" ON public.user_presence
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own presence" ON public.user_presence
  FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'ca' THEN 'pending_onboarding'
      ELSE 'active'
    END
  );

  IF (NEW.raw_user_meta_data->>'role' = 'ca') THEN
    INSERT INTO public.ca_profiles (user_id, first_name, last_name, display_name, slug)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      'ca-' || LOWER(COALESCE(NEW.raw_user_meta_data->>'first_name', 'user')) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
    );
  ELSE
    INSERT INTO public.client_profiles (user_id, first_name, last_name)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  END IF;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);

  -- Create presence record
  INSERT INTO public.user_presence (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  seq_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 10) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.cases
  WHERE case_number LIKE 'CASE-' || year_prefix || '-%';
  
  NEW.case_number := 'CASE-' || year_prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number BEFORE INSERT ON public.cases
  FOR EACH ROW WHEN (NEW.case_number IS NULL)
  EXECUTE FUNCTION generate_case_number();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  seq_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_prefix || '-%';
  
  NEW.invoice_number := 'INV-' || year_prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.invoices
  FOR EACH ROW WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Update CA rating on new review
CREATE OR REPLACE FUNCTION update_ca_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ca_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM public.reviews 
      WHERE ca_id = NEW.ca_id AND is_published = true
    ),
    total_reviews = (
      SELECT COUNT(*) FROM public.reviews 
      WHERE ca_id = NEW.ca_id AND is_published = true
    )
  WHERE id = NEW.ca_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_ca_rating();

-- Create timeline event on case status change
CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.case_timeline (case_id, event_type, title, description, metadata)
    VALUES (
      NEW.id,
      'status_changed',
      'Status changed to ' || NEW.status,
      'Case status was updated from ' || COALESCE(OLD.status, 'new') || ' to ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_case_status_change AFTER UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION log_case_status_change();

-- ==========================================
-- REALTIME
-- ==========================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_tasks;

-- ==========================================
-- SEED DATA (Optional)
-- ==========================================

-- Insert sample service types for reference
-- This would be done through the app normally
