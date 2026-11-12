-- ============================================================================
-- TaxMate Complete Production Alignment Migration
-- Migration: 20261111_complete_production_alignment.sql
-- Purpose:
--   1. Extend Postgres enum types safely outside transactions.
--   2. Harden auth triggers, column-level privilege guards, and admin checks.
--   3. Align public.users <-> public.profiles + organization_id propagation.
--   4. Allow clients.id OR users.id for client_id relations with helper RLS.
--   5. Add all missing columns, compatibility triggers, and new feature tables.
--   6. Replace private ca_profiles leak with public_ca_profiles view.
--   7. Add complete RLS policies across all 33 previously unpolicied tables
--      and storage buckets.
-- ============================================================================

-- 1. ENUM EXTENSIONS (must run outside explicit BEGIN...COMMIT transaction)
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

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. SECURITY & AUTHORIZATION HELPER FUNCTIONS
-- ============================================================================

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

-- ============================================================================
-- 3. PRIVILEGE ESCALATION GUARDS & AUTH SIGNUP TRIGGER
-- ============================================================================

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

-- Add missing columns on users/profiles first so trigger inserts succeed cleanly
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS two_factor_secret_temp TEXT;

ALTER TABLE public.users
  ALTER COLUMN name SET DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

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

  -- Strict role allowlist: never allow self-signup to claim SUPER_ADMIN/ADMIN via user_metadata
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

-- Backfill any existing auth.users or profiles missing in public.users
INSERT INTO public.users (id, email, name, avatar_url, role, status, email_verified, organization_id, metadata)
SELECT
  p.id,
  p.email,
  COALESCE(NULLIF(p.full_name, ''), split_part(p.email, '@', 1)),
  p.avatar_url,
  p.role,
  CASE WHEN p.is_verified THEN 'ACTIVE'::user_status ELSE 'PENDING_VERIFICATION'::user_status END,
  p.is_verified,
  p.organization_id,
  p.metadata
FROM public.profiles p
ON CONFLICT (id) DO UPDATE
SET
  organization_id = COALESCE(public.users.organization_id, EXCLUDED.organization_id),
  name = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name);

-- ============================================================================
-- 4. DROP STRICT client_id -> users(id) FOREIGN KEYS
--    Allows client_id to hold either public.clients.id or public.users.id.
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'client_id'
      AND ccu.table_name = 'users'
      AND tc.table_name IN (
        'tasks', 'cases', 'documents', 'invoices', 'payments',
        'appointments', 'tax_filings', 'compliance_items',
        'compliance_records', 'conversations', 'client_notes'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', rec.table_name, rec.constraint_name);
  END LOOP;
END;
$$;

-- ============================================================================
-- 5. COLUMN ALIGNMENT & COMPATIBILITY TRIGGERS ON EXISTING TABLES
-- ============================================================================

-- CA Profiles & Client Profiles
ALTER TABLE public.ca_profiles
  ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS tan_number TEXT;

ALTER TABLE public.ca_client_relationships
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ DEFAULT NOW();

-- Time Entries (required by CA time tracking page)
ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount DECIMAL(15, 2) DEFAULT 0;

ALTER TABLE public.time_entries
  ALTER COLUMN work_date DROP NOT NULL,
  ALTER COLUMN work_date SET DEFAULT CURRENT_DATE;

CREATE OR REPLACE FUNCTION public.sync_time_entry_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.work_date IS NULL THEN
    NEW.work_date := COALESCE(NEW.start_time::date, CURRENT_DATE);
  END IF;
  IF NEW.start_time IS NULL THEN
    NEW.start_time := NEW.work_date::timestamptz;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_time_entry_fields ON public.time_entries;
CREATE TRIGGER tr_sync_time_entry_fields
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_time_entry_fields();

-- Expenses
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vendor TEXT,
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reimbursable BOOLEAN DEFAULT FALSE;

-- Documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS financial_year TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS is_shared_with_client BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS folder TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE public.documents
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN file_url DROP NOT NULL,
  ALTER COLUMN file_url SET DEFAULT '';

CREATE OR REPLACE FUNCTION public.sync_document_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
CREATE TRIGGER tr_sync_document_fields
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_document_fields();

-- Tasks & Task Comments
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS financial_year TEXT,
  ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT FALSE;

ALTER TABLE public.tasks
  ALTER COLUMN ca_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_task_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.ca_id, auth.uid());
  NEW.ca_id := COALESCE(NEW.ca_id, NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_task_fields ON public.tasks;
CREATE TRIGGER tr_sync_task_fields
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_fields();

ALTER TABLE public.task_comments
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;

ALTER TABLE public.task_comments
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN comment DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_task_comment_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.author_id := COALESCE(NEW.author_id, NEW.user_id, auth.uid());
  NEW.user_id := COALESCE(NEW.user_id, NEW.author_id);
  NEW.content := COALESCE(NEW.content, NEW.comment, '');
  NEW.comment := COALESCE(NEW.comment, NEW.content, '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_task_comment_fields ON public.task_comments;
CREATE TRIGGER tr_sync_task_comment_fields
  BEFORE INSERT OR UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_comment_fields();

-- Cases
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS final_amount DECIMAL(15, 2);

ALTER TABLE public.cases
  ALTER COLUMN client_id DROP NOT NULL;

-- Invoices & Invoice Line Items
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net_15',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS reminder_sent_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT;

ALTER TABLE public.invoices
  ALTER COLUMN ca_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL,
  ALTER COLUMN amount SET DEFAULT 0,
  ALTER COLUMN invoice_number SET DEFAULT ('INV-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)));

CREATE OR REPLACE FUNCTION public.sync_invoice_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
CREATE TRIGGER tr_sync_invoice_fields
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_invoice_fields();

ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS total DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

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

-- Payments & Subscriptions
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

ALTER TABLE public.payments
  ALTER COLUMN ca_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_payment_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv_ca UUID;
  inv_client UUID;
BEGIN
  IF NEW.invoice_id IS NOT NULL AND (NEW.ca_id IS NULL OR NEW.client_id IS NULL) THEN
    SELECT ca_id, client_id INTO inv_ca, inv_client
    FROM public.invoices
    WHERE id = NEW.invoice_id;
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
CREATE TRIGGER tr_sync_payment_fields
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_fields();

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_type TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;

-- Appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS appointment_type TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS livekit_room_name TEXT;

ALTER TABLE public.appointments
  ALTER COLUMN ca_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_appointment_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.ca_id, auth.uid());
  NEW.ca_id := COALESCE(NEW.ca_id, NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_appointment_fields ON public.appointments;
CREATE TRIGGER tr_sync_appointment_fields
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_appointment_fields();

-- Conversations & Messages
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS title TEXT;

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

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Compliance & Tax Forms
ALTER TABLE public.compliance_deadlines
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS deadline_type TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS client_id UUID,
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ca_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE public.compliance_deadlines
  ALTER COLUMN compliance_type DROP NOT NULL,
  ALTER COLUMN period_type DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL;

ALTER TABLE public.compliance_records
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS assessment_year TEXT,
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end DATE,
  ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE public.compliance_calendar
  ADD COLUMN IF NOT EXISTS financial_year TEXT;

ALTER TABLE public.tax_filings
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS assessment_year TEXT,
  ADD COLUMN IF NOT EXISTS filing_period TEXT,
  ADD COLUMN IF NOT EXISTS tax_payable DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_due DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.tax_form_templates
  ADD COLUMN IF NOT EXISTS financial_year_from TEXT,
  ADD COLUMN IF NOT EXISTS financial_year_to TEXT;

ALTER TABLE public.client_tax_forms
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ca_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- E-Signatures
ALTER TABLE public.esignature_requests
  ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS otp_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- Notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app';

CREATE OR REPLACE FUNCTION public.sync_notification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.read := COALESCE(NEW.read, NEW.is_read, FALSE);
    NEW.is_read := NEW.read;
  ELSE
    IF NEW.is_read IS DISTINCT FROM OLD.is_read THEN
      NEW.read := NEW.is_read;
    ELSIF NEW.read IS DISTINCT FROM OLD.read THEN
      NEW.is_read := NEW.read;
    END IF;
  END IF;
  IF (NEW.read OR NEW.is_read) AND NEW.read_at IS NULL THEN
    NEW.read_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_notification_fields ON public.notifications;
CREATE TRIGGER tr_sync_notification_fields
  BEFORE INSERT OR UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_notification_fields();

-- Support Tickets
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS priority_label TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS admin_response TEXT,
  ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

ALTER TABLE public.support_tickets
  ALTER COLUMN user_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_support_ticket_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, NEW.user_id, auth.uid());
  NEW.user_id := COALESCE(NEW.user_id, NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_support_ticket_fields ON public.support_tickets;
CREATE TRIGGER tr_sync_support_ticket_fields
  BEFORE INSERT OR UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_support_ticket_fields();

-- File Uploads
ALTER TABLE public.file_uploads
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS entity_id UUID;

ALTER TABLE public.file_uploads
  ALTER COLUMN bucket DROP NOT NULL,
  ALTER COLUMN bucket SET DEFAULT 'uploads',
  ALTER COLUMN path DROP NOT NULL,
  ALTER COLUMN path SET DEFAULT '';

CREATE OR REPLACE FUNCTION public.sync_file_upload_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
CREATE TRIGGER tr_sync_file_upload_fields
  BEFORE INSERT OR UPDATE ON public.file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_file_upload_fields();

-- ============================================================================
-- 6. NEW APPLICATION TABLES
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_ca_eng_req_ca ON public.ca_engagement_requests(ca_id);
CREATE INDEX IF NOT EXISTS idx_ca_eng_req_client ON public.ca_engagement_requests(client_user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_ca ON public.proposals(ca_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON public.time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.time_entries(user_id);

DROP TRIGGER IF EXISTS tr_ca_engagement_requests_updated_at ON public.ca_engagement_requests;
CREATE TRIGGER tr_ca_engagement_requests_updated_at BEFORE UPDATE ON public.ca_engagement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_proposals_updated_at ON public.proposals;
CREATE TRIGGER tr_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER tr_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER tr_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. PUBLIC CA PROFILES VIEW (NO PRIVATE PII / PAN / BANK DETAILS)
-- ============================================================================

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
-- 8. COMPLETE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_engagement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Users & Profiles Admin Access + CA Profiles Private Select + Update
DROP POLICY IF EXISTS users_admin_all ON public.users;
CREATE POLICY users_admin_all ON public.users
  FOR ALL
  USING (public.is_admin_user() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin_user() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS ca_profiles_public_select ON public.ca_profiles;
DROP POLICY IF EXISTS ca_profiles_private_select ON public.ca_profiles;
CREATE POLICY ca_profiles_private_select ON public.ca_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_user() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS ca_profiles_self_insert ON public.ca_profiles;
CREATE POLICY ca_profiles_self_insert ON public.ca_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin_user() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS ca_profiles_self_update ON public.ca_profiles;
CREATE POLICY ca_profiles_self_update ON public.ca_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_user() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin_user() OR auth.role() = 'service_role');

-- Updated client-aware operational policies
DROP POLICY IF EXISTS tasks_access ON public.tasks;
CREATE POLICY tasks_access ON public.tasks
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS cases_access ON public.cases;
CREATE POLICY cases_access ON public.cases
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS documents_access ON public.documents;
CREATE POLICY documents_access ON public.documents
  FOR ALL
  USING (
    user_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS invoices_access ON public.invoices;
CREATE POLICY invoices_access ON public.invoices
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS payments_access ON public.payments;
CREATE POLICY payments_access ON public.payments
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS tax_filings_access ON public.tax_filings;
CREATE POLICY tax_filings_access ON public.tax_filings
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS compliance_items_access ON public.compliance_items;
CREATE POLICY compliance_items_access ON public.compliance_items
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR assigned_to = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS appointments_access ON public.appointments;
CREATE POLICY appointments_access ON public.appointments
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR created_by = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS compliance_deadlines_select ON public.compliance_deadlines;
DROP POLICY IF EXISTS compliance_deadlines_read ON public.compliance_deadlines;
DROP POLICY IF EXISTS compliance_deadlines_admin ON public.compliance_deadlines;
DROP POLICY IF EXISTS compliance_deadlines_write ON public.compliance_deadlines;
CREATE POLICY compliance_deadlines_read ON public.compliance_deadlines
  FOR SELECT
  USING (
    client_id IS NULL
    OR ca_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  );
CREATE POLICY compliance_deadlines_write ON public.compliance_deadlines
  FOR ALL
  USING (ca_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());

-- All remaining tables that previously had RLS enabled with 0 policies
DROP POLICY IF EXISTS tax_form_templates_read ON public.tax_form_templates;
CREATE POLICY tax_form_templates_read ON public.tax_form_templates
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role') OR public.is_admin_user());
DROP POLICY IF EXISTS tax_form_templates_admin ON public.tax_form_templates;
CREATE POLICY tax_form_templates_admin ON public.tax_form_templates
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS client_tax_forms_access ON public.client_tax_forms;
CREATE POLICY client_tax_forms_access ON public.client_tax_forms
  FOR ALL
  USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());

DROP POLICY IF EXISTS compliance_filings_access ON public.compliance_filings;
CREATE POLICY compliance_filings_access ON public.compliance_filings
  FOR ALL
  USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());

DROP POLICY IF EXISTS compliance_calendar_read ON public.compliance_calendar;
CREATE POLICY compliance_calendar_read ON public.compliance_calendar
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS compliance_calendar_admin ON public.compliance_calendar;
CREATE POLICY compliance_calendar_admin ON public.compliance_calendar
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS compliance_records_access ON public.compliance_records;
CREATE POLICY compliance_records_access ON public.compliance_records
  FOR ALL
  USING (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user());

DROP POLICY IF EXISTS compliance_automation_rules_access ON public.compliance_automation_rules;
CREATE POLICY compliance_automation_rules_access ON public.compliance_automation_rules
  FOR ALL
  USING (ca_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS conversation_participants_access ON public.conversation_participants;
CREATE POLICY conversation_participants_access ON public.conversation_participants
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())
    )
    OR public.is_admin_user()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())
    )
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS message_read_receipts_access ON public.message_read_receipts;
CREATE POLICY message_read_receipts_access ON public.message_read_receipts
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_read_receipts.message_id
        AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())
    )
    OR public.is_admin_user()
  )
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS typing_indicators_access ON public.typing_indicators;
CREATE POLICY typing_indicators_access ON public.typing_indicators
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = typing_indicators.conversation_id
        AND (auth.uid() = ANY(c.participant_ids) OR c.ca_id = auth.uid() OR c.client_id = auth.uid())
    )
    OR public.is_admin_user()
  )
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS task_comments_access ON public.task_comments;
CREATE POLICY task_comments_access ON public.task_comments
  FOR ALL
  USING (
    author_id = auth.uid()
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_comments.task_id
        AND (t.ca_id = auth.uid() OR t.assigned_to = auth.uid() OR t.created_by = auth.uid() OR public.is_client_owner_or_ca(t.client_id))
    )
    OR public.is_admin_user()
  )
  WITH CHECK (
    author_id = auth.uid()
    OR user_id = auth.uid()
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS case_activities_access ON public.case_activities;
CREATE POLICY case_activities_access ON public.case_activities
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_activities.case_id
        AND (c.ca_id = auth.uid() OR c.assigned_to = auth.uid() OR public.is_client_owner_or_ca(c.client_id))
    )
    OR public.is_admin_user()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS time_entries_access ON public.time_entries;
CREATE POLICY time_entries_access ON public.time_entries
  FOR ALL
  USING (user_id = auth.uid() OR public.is_client_owner_or_ca(client_id) OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS invoice_items_access ON public.invoice_items;
CREATE POLICY invoice_items_access ON public.invoice_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_items.invoice_id
        AND (i.ca_id = auth.uid() OR i.created_by = auth.uid() OR public.is_client_owner_or_ca(i.client_id))
    )
    OR public.is_admin_user()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_items.invoice_id
        AND (i.ca_id = auth.uid() OR i.created_by = auth.uid())
    )
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS invoice_line_items_access ON public.invoice_line_items;
CREATE POLICY invoice_line_items_access ON public.invoice_line_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (i.ca_id = auth.uid() OR i.created_by = auth.uid() OR public.is_client_owner_or_ca(i.client_id))
    )
    OR public.is_admin_user()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (i.ca_id = auth.uid() OR i.created_by = auth.uid())
    )
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS expenses_access ON public.expenses;
CREATE POLICY expenses_access ON public.expenses
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS subscriptions_access ON public.subscriptions;
CREATE POLICY subscriptions_access ON public.subscriptions
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS user_sessions_access ON public.user_sessions;
CREATE POLICY user_sessions_access ON public.user_sessions
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS user_presence_read ON public.user_presence;
CREATE POLICY user_presence_read ON public.user_presence
  FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));
DROP POLICY IF EXISTS user_presence_write ON public.user_presence;
CREATE POLICY user_presence_write ON public.user_presence
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS onboarding_access ON public.onboarding;
CREATE POLICY onboarding_access ON public.onboarding
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS onboarding_data_access ON public.onboarding_data;
CREATE POLICY onboarding_data_access ON public.onboarding_data
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS notes_access ON public.notes;
CREATE POLICY notes_access ON public.notes
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS client_notes_access ON public.client_notes;
CREATE POLICY client_notes_access ON public.client_notes
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR author_id = auth.uid()
    OR (NOT is_private AND public.is_client_owner_or_ca(client_id))
    OR public.is_admin_user()
  )
  WITH CHECK (ca_id = auth.uid() OR author_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS team_members_access ON public.team_members;
CREATE POLICY team_members_access ON public.team_members
  FOR ALL
  USING (ca_id = auth.uid() OR member_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS activity_logs_select ON public.activity_logs;
CREATE POLICY activity_logs_select ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());
DROP POLICY IF EXISTS activity_logs_insert ON public.activity_logs;
CREATE POLICY activity_logs_insert ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS activity_feed_access ON public.activity_feed;
CREATE POLICY activity_feed_access ON public.activity_feed
  FOR ALL
  USING (user_id = auth.uid() OR actor_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR actor_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS reviews_read ON public.reviews;
CREATE POLICY reviews_read ON public.reviews FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS reviews_write ON public.reviews;
CREATE POLICY reviews_write ON public.reviews
  FOR ALL USING (client_id = auth.uid() OR public.is_admin_user()) WITH CHECK (client_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS blog_posts_read ON public.blog_posts;
CREATE POLICY blog_posts_read ON public.blog_posts
  FOR SELECT USING (published = TRUE OR user_id = auth.uid() OR public.is_admin_user());
DROP POLICY IF EXISTS blog_posts_write ON public.blog_posts;
CREATE POLICY blog_posts_write ON public.blog_posts
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS support_tickets_access ON public.support_tickets;
CREATE POLICY support_tickets_access ON public.support_tickets
  FOR ALL
  USING (user_id = auth.uid() OR created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS file_uploads_access ON public.file_uploads;
CREATE POLICY file_uploads_access ON public.file_uploads
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS ca_firm_members_access ON public.ca_firm_members;
CREATE POLICY ca_firm_members_access ON public.ca_firm_members
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.ca_firms f WHERE f.id = ca_firm_members.firm_id AND f.ca_id = auth.uid())
    OR public.is_admin_user()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.ca_firms f WHERE f.id = ca_firm_members.firm_id AND f.ca_id = auth.uid())
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS ca_specializations_read ON public.ca_specializations;
CREATE POLICY ca_specializations_read ON public.ca_specializations FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS ca_specializations_write ON public.ca_specializations;
CREATE POLICY ca_specializations_write ON public.ca_specializations
  FOR ALL USING (ca_id = auth.uid() OR public.is_admin_user()) WITH CHECK (ca_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS audit_logs_read ON public.audit_logs;
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT USING (public.is_admin_user());
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS system_logs_read ON public.system_logs;
CREATE POLICY system_logs_read ON public.system_logs FOR SELECT USING (public.is_admin_user());
DROP POLICY IF EXISTS system_logs_insert ON public.system_logs;
CREATE POLICY system_logs_insert ON public.system_logs FOR INSERT WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS feature_flags_admin ON public.feature_flags;
CREATE POLICY feature_flags_admin ON public.feature_flags
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS system_settings_admin ON public.system_settings;
CREATE POLICY system_settings_admin ON public.system_settings
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS verification_tokens_service ON public.verification_tokens;
CREATE POLICY verification_tokens_service ON public.verification_tokens
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS login_attempt_logs_admin ON public.login_attempt_logs;
CREATE POLICY login_attempt_logs_admin ON public.login_attempt_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS password_change_logs_admin ON public.password_change_logs;
CREATE POLICY password_change_logs_admin ON public.password_change_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

-- New Tables RLS
DROP POLICY IF EXISTS ca_engagement_requests_access ON public.ca_engagement_requests;
CREATE POLICY ca_engagement_requests_access ON public.ca_engagement_requests
  FOR ALL
  USING (client_user_id = auth.uid() OR ca_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (client_user_id = auth.uid() OR ca_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS proposals_access ON public.proposals;
CREATE POLICY proposals_access ON public.proposals
  FOR ALL
  USING (
    ca_id = auth.uid()
    OR client_user_id = auth.uid()
    OR public.is_client_owner_or_ca(client_id)
    OR public.is_admin_user()
  )
  WITH CHECK (
    ca_id = auth.uid()
    OR client_user_id = auth.uid()
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS payment_methods_access ON public.payment_methods;
CREATE POLICY payment_methods_access ON public.payment_methods
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_user()) WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS contact_inquiries_insert ON public.contact_inquiries;
CREATE POLICY contact_inquiries_insert ON public.contact_inquiries FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS contact_inquiries_admin ON public.contact_inquiries;
CREATE POLICY contact_inquiries_admin ON public.contact_inquiries
  FOR SELECT USING (public.is_admin_user());
DROP POLICY IF EXISTS contact_inquiries_admin_write ON public.contact_inquiries;
CREATE POLICY contact_inquiries_admin_write ON public.contact_inquiries
  FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- ============================================================================
-- 9. STORAGE BUCKETS & COLLABORATIVE DOCUMENT RLS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('uploads', 'uploads', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
-- 10. REALTIME PUBLICATION SYNC
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'proposals',
    'ca_engagement_requests',
    'compliance_records',
    'compliance_deadlines',
    'time_entries',
    'support_tickets',
    'task_comments',
    'invoices',
    'payments',
    'notifications'
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

COMMIT;

