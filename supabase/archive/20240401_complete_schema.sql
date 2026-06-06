-- ============================================================================
-- TAXMATE: Complete Database Schema
-- This migration creates all necessary tables for the Taxmate platform
-- ============================================================================

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ca', 'client', 'staff')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  device_sessions JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CA (CHARTERED ACCOUNTANT) PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ca_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  firm_address TEXT,
  gst_number TEXT UNIQUE,
  pan_number TEXT UNIQUE,
  icai_registration_number TEXT UNIQUE,
  experience_years INT,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_documents JSONB DEFAULT '{}',
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  bank_account TEXT,
  bank_ifsc TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  max_clients INT DEFAULT 10,
  max_staff INT DEFAULT 5,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  total_reviews INT DEFAULT 0,
  total_revenue NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CLIENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('individual', 'business', 'startup', 'huf', 'partnership', 'llp')),
  gst_number TEXT,
  pan_number TEXT UNIQUE,
  aadhar_number TEXT,
  uin_number TEXT,
  client_category TEXT DEFAULT 'general' CHECK (client_category IN ('general', 'healthcare', 'education', 'retail', 'manufacturing', 'it', 'finance', 'other')),
  business_address TEXT,
  country TEXT DEFAULT 'India',
  state TEXT,
  city TEXT,
  pincode TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  gstin_validity_date TIMESTAMP WITH TIME ZONE,
  pan_validity_date TIMESTAMP WITH TIME ZONE,
  last_filing_date TIMESTAMP WITH TIME ZONE,
  next_filing_due TIMESTAMP WITH TIME ZONE,
  total_invoices INT DEFAULT 0,
  total_paid NUMERIC(15, 2) DEFAULT 0,
  total_pending NUMERIC(15, 2) DEFAULT 0,
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. STAFF MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  ca_id UUID NOT NULL REFERENCES public.ca_profiles(id) ON DELETE CASCADE,
  designation TEXT NOT NULL CHECK (designation IN ('junior_accountant', 'senior_accountant', 'manager', 'lead')),
  department TEXT DEFAULT 'general' CHECK (department IN ('general', 'tax', 'audit', 'compliance', 'client_support')),
  assigned_clients TEXT[] DEFAULT ARRAY[]::TEXT[],
  permissions TEXT[] DEFAULT ARRAY['view_clients', 'view_documents', 'chat_clients']::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  salary_structure JSONB,
  performance_rating NUMERIC(3, 2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. SERVICES & OFFERINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gst_filing', 'itr_filing', 'audit', 'company_registration', 'compliance', 'bookkeeping', 'consultation', 'other')),
  description TEXT,
  pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'custom', 'range')),
  price NUMERIC(10, 2),
  price_range_min NUMERIC(10, 2),
  price_range_max NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  duration_days INT,
  is_active BOOLEAN DEFAULT TRUE,
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'platform', 'in_person', 'video_call')),
  turnaround_time_days INT,
  icon_emoji TEXT,
  order_count INT DEFAULT 0,
  avg_rating NUMERIC(3, 2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. DOCUMENTS & FILE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  file_type TEXT,
  category TEXT NOT NULL CHECK (category IN ('gst_docs', 'itr_docs', 'bank_statements', 'invoices', 'receipts', 'compliance_docs', 'identity_proof', 'business_proof', 'other')),
  subcategory TEXT,
  folder_path TEXT,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  ocr_text TEXT,
  is_scanned BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  validity_status TEXT CHECK (validity_status IN ('valid', 'expiring_soon', 'expired')),
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_shared_with_client BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES public.users(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'shared', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. REAL-TIME COMMUNICATION - CHAT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type TEXT NOT NULL CHECK (room_type IN ('direct', 'group', 'broadcast')),
  name TEXT,
  description TEXT,
  participants UUID[] NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'document', 'system')),
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INT,
  file_type TEXT,
  media_url TEXT,
  media_type TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  read_by UUID[] DEFAULT ARRAY[]::UUID[],
  reactions JSONB DEFAULT '{}',
  reply_to_message_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. VOICE & VIDEO CALLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video', 'screen_share')),
  initiator_id UUID NOT NULL REFERENCES public.users(id),
  participants UUID[] NOT NULL,
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connected', 'ended', 'missed', 'declined')),
  duration_seconds INT,
  recording_url TEXT,
  is_recorded BOOLEAN DEFAULT FALSE,
  has_screen_share BOOLEAN DEFAULT FALSE,
  call_quality TEXT CHECK (call_quality IN ('poor', 'fair', 'good', 'excellent')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. APPOINTMENTS & SCHEDULING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT DEFAULT 'meeting' CHECK (appointment_type IN ('meeting', 'consultation', 'filing_discussion', 'follow_up', 'review')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  location TEXT,
  meeting_link TEXT,
  meeting_platform TEXT CHECK (meeting_platform IN ('google_meet', 'zoom', 'teams', 'in_person', 'phone')),
  notes TEXT,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  reminders_sent BOOLEAN DEFAULT FALSE,
  reminder_time_minutes INT DEFAULT 30,
  color_tag TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. TASKS & WORKFLOW
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('gst_filing', 'itr_filing', 'audit', 'compliance', 'follow_up', 'document_review', 'general')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  subtasks JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  comments_count INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. BILLING & INVOICING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  line_items JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 18.00,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  total_amount NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) DEFAULT 0,
  amount_due NUMERIC(12, 2),
  currency TEXT DEFAULT 'INR',
  payment_terms TEXT,
  notes TEXT,
  bank_details JSONB,
  gst_details JSONB,
  file_url TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  ca_id UUID NOT NULL REFERENCES public.users(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'bank_transfer', 'upi', 'check', 'cash', 'crypto')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  payment_gateway_response JSONB,
  reference_number TEXT,
  notes TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 13. SUBSCRIPTIONS & BILLING PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('free', 'basic', 'professional', 'enterprise')),
  description TEXT,
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  max_clients INT,
  max_staff INT,
  max_storage_gb INT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.ca_profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  total_paid NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 14. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('filing_deadline', 'task_assigned', 'payment_reminder', 'message', 'document_shared', 'appointment', 'system', 'transaction')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  action_text TEXT,
  channels TEXT[] DEFAULT ARRAY['push']::TEXT[],
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 15. COMPLIANCE & FILINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.compliance_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filing_type TEXT NOT NULL CHECK (filing_type IN ('gst_return', 'itr', 'audit_report', 'form_16', 'form_15h', 'other')),
  financial_year_start DATE,
  financial_year_end DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'filed', 'rejected', 'cancelled')),
  due_date DATE,
  filed_date DATE,
  reference_number TEXT,
  filing_details JSONB DEFAULT '{}',
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 16. AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  description TEXT,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 17. FEEDBACK & REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  helpful_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 18. ACTIVITY FEED
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('client_added', 'document_uploaded', 'invoice_created', 'payment_received', 'appointment_scheduled', 'task_assigned', 'filing_completed', 'message_sent')),
  title TEXT NOT NULL,
  description TEXT,
  related_id UUID,
  related_type TEXT,
  icon_emoji TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'ca_only', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_clients_ca_id ON public.clients(ca_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_expiry ON public.documents(expiry_date);
CREATE INDEX idx_messages_chat_room_id ON public.messages(chat_room_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_tasks_ca_id ON public.tasks(ca_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_appointments_ca_id ON public.appointments(ca_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_compliance_filing_status ON public.compliance_filings(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_filings ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- CA can view their own profile and clients
CREATE POLICY "CA view own profile" ON public.ca_profiles
  FOR SELECT USING (auth.uid() = id);

-- Clients can only view their own documents
CREATE POLICY "Clients view own documents" ON public.documents
  FOR SELECT USING (
    auth.uid() IN (SELECT ca_id FROM public.clients WHERE id = client_id)
    OR auth.uid() = ca_id
  );

-- Users can only see messages in their chat rooms
CREATE POLICY "Users view own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR auth.uid() IN (
      SELECT UNNEST(participants) FROM public.chat_rooms WHERE id = chat_room_id
    )
  );

-- ============================================================================
-- FUNCTIONS FOR AUTOMATION
-- ============================================================================

-- Function to update user updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update invoice amount_due
CREATE OR REPLACE FUNCTION public.update_invoice_amount_due()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount_due = NEW.total_amount - NEW.amount_paid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_amount_due BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_amount_due();

-- ============================================================================
-- INITIAL SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO public.subscription_plans (name, tier, price, max_clients, max_staff, max_storage_gb, features, description)
VALUES
  ('Free', 'free', 0, 5, 1, 5, '{"analytics": false, "advanced_ai": false, "priority_support": false}'::jsonb, 'Free tier for getting started'),
  ('Basic', 'basic', 999, 25, 3, 50, '{"analytics": true, "advanced_ai": false, "priority_support": false}'::jsonb, 'Perfect for individual CAs'),
  ('Professional', 'professional', 2999, 100, 10, 250, '{"analytics": true, "advanced_ai": true, "priority_support": true}'::jsonb, 'For growing CA practices'),
  ('Enterprise', 'enterprise', 9999, 999, 50, 1000, '{"analytics": true, "advanced_ai": true, "priority_support": true, "custom_features": true}'::jsonb, 'For large CA firms');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
