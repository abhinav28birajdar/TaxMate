-- ============================================================================
-- TaxMate Production Migration: Unified Clients, Tags, Compliance & Profiles
-- Migration: 20261018_production_schema_and_clients.sql
-- ============================================================================

-- 1. Ensure profiles table has organization_id column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID;

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- 2. Clients Table (Comprehensive client entity used across CA firm & client portal)
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

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_ca_id ON public.clients(assigned_ca_id);
CREATE INDEX IF NOT EXISTS idx_clients_portal_user_id ON public.clients(portal_user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_clients_pan ON public.clients(pan);
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON public.clients(gstin);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients RLS Policies
DROP POLICY IF EXISTS clients_ca_access ON public.clients;
CREATE POLICY clients_ca_access ON public.clients
  FOR ALL
  USING (
    auth.uid() = assigned_ca_id
    OR auth.uid() = portal_user_id
    OR auth.role() = 'service_role'
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.ca_firm_members
      WHERE user_id = auth.uid() AND firm_id = clients.organization_id
    )
  )
  WITH CHECK (
    auth.uid() = assigned_ca_id
    OR auth.role() = 'service_role'
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.ca_firm_members
      WHERE user_id = auth.uid() AND firm_id = clients.organization_id
    )
  );

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  type TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_org ON public.tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(type);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tags_all_access ON public.tags;
CREATE POLICY tags_all_access ON public.tags
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 4. Compliance Deadlines Table
CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compliance_type TEXT NOT NULL,
  period_type TEXT NOT NULL,
  day_of_month INTEGER,
  month_of_year INTEGER,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_type ON public.compliance_deadlines(compliance_type);
CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_active ON public.compliance_deadlines(is_active);

ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compliance_deadlines_read ON public.compliance_deadlines;
CREATE POLICY compliance_deadlines_read ON public.compliance_deadlines
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS compliance_deadlines_write ON public.compliance_deadlines;
CREATE POLICY compliance_deadlines_write ON public.compliance_deadlines
  FOR ALL
  USING (public.is_admin_user() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin_user() OR auth.role() = 'service_role');

-- 5. Add clients and tags to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tags;
  END IF;
END;
$$;
