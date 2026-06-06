-- =========================================================================
-- TAXMATE COMPLETE SUPABASE SCHEMA
-- Unified Database Architecture with Auth Integration, RLS, & Automation
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for Roles and Statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'CA', 'CLIENT', 'STAFF');
    CREATE TYPE account_status AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
    CREATE TYPE case_status AS ENUM ('OPEN', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED');
    CREATE TYPE billing_status AS ENUM ('UNPAID', 'PAID', 'PARTIAL', 'OVERDUE');
    CREATE TYPE compliance_status AS ENUM ('UPCOMING', 'DUE_SOON', 'DUE_TODAY', 'OVERDUE', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table: users (Integrated with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'CLIENT',
  status account_status DEFAULT 'PENDING_VERIFICATION',
  avatar_url TEXT,
  phone TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ca_profiles
CREATE TABLE IF NOT EXISTS public.ca_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  membership_number TEXT,
  firm_name TEXT,
  specialization TEXT[],
  years_experience INT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL DEFAULT 0,
  bio TEXT,
  address TEXT,
  website TEXT,
  ca_logo TEXT
);

-- Table: client_profiles
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  pan_number TEXT,
  gstin TEXT,
  business_name TEXT,
  business_type TEXT,
  industry TEXT,
  address TEXT
);

-- Table: cases
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status case_status DEFAULT 'OPEN',
  client_id UUID REFERENCES public.users(id) NOT NULL,
  ca_id UUID REFERENCES public.users(id) NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT,
  uploaded_by UUID REFERENCES public.users(id) NOT NULL,
  client_id UUID REFERENCES public.users(id),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.users(id) NOT NULL,
  ca_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  gst_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  due_date TIMESTAMPTZ,
  status billing_status DEFAULT 'UNPAID',
  payment_method TEXT,
  razorpay_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: compliance_deadlines
CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  status compliance_status DEFAULT 'UPCOMING',
  category TEXT, -- e.g., 'GST', 'ITR', 'TDS'
  target_role user_role, -- e.g., 'CLIENT' to notify all clients
  user_id UUID REFERENCES public.users(id), -- Specific target user
  is_automated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTIONS & TRIGGERS

-- Automatically sync public.users on auth registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CLIENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_cases_timestamp BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_invoices_timestamp BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ROW-LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CAs can view/manage cases they are assigned to" ON public.cases FOR ALL USING (auth.uid() = ca_id);
CREATE POLICY "Clients can view cases assigned to them" ON public.cases FOR SELECT USING (auth.uid() = client_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access your own documents" ON public.documents FOR ALL USING (auth.uid() = uploaded_by OR auth.uid() = client_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access your own invoices" ON public.invoices FOR ALL USING (auth.uid() = client_id OR auth.uid() = ca_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access your own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- VIEWS FOR EASY DATA FETCHING
CREATE OR REPLACE VIEW active_cases_summary AS
SELECT 
  c.id, c.case_number, c.title, c.status, c.priority, c.due_date,
  u_client.name as client_name,
  u_ca.name as ca_name
FROM public.cases c
JOIN public.users u_client ON c.client_id = u_client.id
JOIN public.users u_ca ON c.ca_id = u_ca.id
WHERE c.status != 'CLOSED';
