-- ================================================================
-- TAXMATE ENHANCED - COMPLETE SQL SCHEMA
-- ================================================================
-- Version: 3.0 (Production Ready)
-- Last Updated: 2025-04-04
-- 
-- This schema includes:
-- - 30+ core tables
-- - AI & Analytics features
-- - E-signature & Document Management
-- - Compliance Automation
-- - Multi-language support
-- - Advanced Security
-- - Client Portal
-- - Tax Form Templates
-- - Bulk Operations
-- - Integration Management
-- ================================================================

-- ================================================================
-- SECTION 1: EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================================
-- SECTION 2: CUSTOM TYPES (ENUMS)
-- ================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'ca', 'firm', 'admin', 'support');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_onboarding', 'pending_verification', 'trial_expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'under_review', 'verified', 'rejected', 'auto_verified');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold', 'revision');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'rejected', 'terminated', 'paused');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled', 'partially_paid', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'pending_signature', 'signed', 'rejected', 'verified');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('not_due', 'due_soon', 'overdue', 'completed', 'na');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- SECTION 3: CORE TABLES (Enhanced)
-- ================================================================

-- 3.1 USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'ca', 'firm', 'admin', 'support')),
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    
    -- Subscription & Trial
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    trial_ends_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    
    -- Settings
    two_factor_enabled BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "rating_visibility": "public"}',
    
    -- Metadata
    device_tokens TEXT[],
    ip_whitelist INET[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_last_login ON public.users(last_login_at DESC);

-- 3.2 CA PROFILES (Enhanced)
CREATE TABLE IF NOT EXISTS public.ca_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    tagline TEXT,
    bio TEXT,
    
    -- Professional Details
    icai_membership_number TEXT UNIQUE,
    cop_number TEXT,
    pan_number TEXT UNIQUE,
    firm_name TEXT,
    years_of_experience INTEGER DEFAULT 0,
    qualification TEXT,
    
    -- Location & Contact
    office_address JSONB DEFAULT '{}',
    service_locations TEXT[],
    consultation_modes TEXT[] DEFAULT '{online}',
    working_hours JSONB DEFAULT '{}',
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    is_accepting_clients BOOLEAN DEFAULT true,
    max_active_cases INTEGER DEFAULT 50,
    max_clients INTEGER DEFAULT 500,
    
    -- Verification & Premium
    is_premium BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'unverified',
    verification_documents JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    
    -- AI & Automation
    ai_enabled BOOLEAN DEFAULT true,
    
    -- Stats
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    completed_cases INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 100.00,
    avg_response_time INTEGER DEFAULT 0,
    
    -- SEO & Discovery
    slug TEXT UNIQUE,
    search_keywords TEXT[],
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_profiles_user ON public.ca_profiles(user_id);
CREATE INDEX idx_ca_profiles_verification ON public.ca_profiles(verification_status);
CREATE INDEX idx_ca_profiles_rating ON public.ca_profiles(average_rating DESC);

-- 3.3 CLIENT PROFILES (Enhanced)
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    
    -- Tax & Legal
    pan_number TEXT,
    tax_id TEXT,
    gstin TEXT,
    
    -- Contact & Address
    address JSONB DEFAULT '{}',
    alternate_phone TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'English',
    communication_preference TEXT DEFAULT 'email',
    
    -- Business Info
    is_business BOOLEAN DEFAULT false,
    business_name TEXT,
    business_type TEXT,
    business_pan TEXT,
    business_gstin TEXT,
    annual_turnover DECIMAL(15,2),
    
    -- Client Profile
    client_category TEXT DEFAULT 'individual',
    industry TEXT,
    employee_count INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_profiles_user ON public.client_profiles(user_id);
CREATE INDEX idx_client_profiles_business ON public.client_profiles(is_business);

-- 3.4 FIRM PROFILES (Enhanced)
CREATE TABLE IF NOT EXISTS public.firm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    firm_name TEXT NOT NULL,
    firm_registration_number TEXT UNIQUE,
    logo_url TEXT,
    description TEXT,
    
    address JSONB DEFAULT '{}',
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Firm Stats
    total_cas INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    total_cases INTEGER DEFAULT 0,
    monthly_revenue DECIMAL(15,2),
    
    -- Verification
    verification_status TEXT DEFAULT 'unverified',
    verification_documents JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    
    -- Settings
    is_premium BOOLEAN DEFAULT false,
    billing_monthly BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 4: SERVICE CATALOG & SPECIALIZATIONS (Enhanced)
-- ================================================================

-- 4.1 SERVICE TYPES (Master)
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    icon_url TEXT,
    
    -- Compliance
    compliance_type TEXT,
    compliance_frequency TEXT,
    estimated_days INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 CA SERVICES (Enhanced)
CREATE TABLE IF NOT EXISTS public.ca_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    service_type_id UUID REFERENCES public.service_types(id),
    service_code TEXT NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    max_price DECIMAL(12,2),
    currency TEXT DEFAULT 'INR',
    pricing_type TEXT DEFAULT 'fixed',
    
    -- Details
    estimated_days INTEGER,
    documents_required TEXT[],
    deliverables TEXT[],
    
    -- AI Recommendations
    ai_recommended BOOLEAN DEFAULT false,
    recommendation_score DECIMAL(3,2),
    
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 CA SPECIALIZATIONS
CREATE TABLE IF NOT EXISTS public.ca_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    specialization TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    is_certified BOOLEAN DEFAULT false,
    certification_details TEXT,
    certification_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ca_id, specialization)
);

-- ================================================================
-- SECTION 5: RELATIONSHIPS & CASES (Enhanced)
-- ================================================================

-- 5.1 CA-CLIENT RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.ca_client_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    
    status TEXT DEFAULT 'pending',
    
    requested_by UUID REFERENCES public.users(id),
    request_message TEXT,
    rejection_reason TEXT,
    
    -- Relationship Metadata
    primary_contact BOOLEAN DEFAULT true,
    shared_account BOOLEAN DEFAULT false,
    
    connected_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ca_id, client_id)
);

-- 5.2 CASES (Enhanced)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE,
    
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.users(id),
    supervised_by UUID REFERENCES public.users(id),
    
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    financial_year TEXT,
    
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    
    quoted_amount DECIMAL(12,2),
    final_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'INR',
    
    deadline TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    internal_notes TEXT,
    client_notes TEXT,
    
    -- AI Analysis
    ai_suggested_actions TEXT[],
    risk_level TEXT,
    
    -- Tags
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_ca ON public.cases(ca_id);
CREATE INDEX idx_cases_client ON public.cases(client_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_deadline ON public.cases(deadline);

-- 5.3 CASE TEMPLATES
CREATE TABLE IF NOT EXISTS public.case_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    
    checklist JSONB DEFAULT '[]',
    documents_template JSONB DEFAULT '[]',
    timeline_days INTEGER,
    
    is_public BOOLEAN DEFAULT false,
    use_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4 CASE ACTIVITIES
CREATE TABLE IF NOT EXISTS public.case_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    is_visible_to_client BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_activities_case ON public.case_activities(case_id);

-- ================================================================
-- SECTION 6: DOCUMENTS & E-SIGNATURES
-- ================================================================

-- 6.1 DOCUMENTS (Enhanced)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) NOT NULL,
    
    name TEXT NOT NULL,
    original_name TEXT,
    file_url TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    mime_type TEXT,
    size INTEGER,
    
    category TEXT,
    financial_year TEXT,
    description TEXT,
    
    -- OCR & AI Analysis
    ocr_data JSONB DEFAULT '{}',
    ai_extracted_fields JSONB DEFAULT '{}',
    extraction_confidence DECIMAL(5,2),
    
    status TEXT DEFAULT 'draft',
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    
    is_shared_with_ca BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_client ON public.documents(client_id);

-- 6.2 E-SIGNATURE REQUESTS
CREATE TABLE IF NOT EXISTS public.esignature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    
    requester_id UUID REFERENCES public.users(id) NOT NULL,
    signer_id UUID REFERENCES public.users(id) NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT,
    
    signature_url TEXT,
    signed_at TIMESTAMPTZ,
    
    pan_verified BOOLEAN DEFAULT false,
    otp_verified BOOLEAN DEFAULT false,
    
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    
    -- External Integration
    esign_provider TEXT,
    esign_request_id TEXT,
    esign_response JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3 DIGITAL LOCKER
CREATE TABLE IF NOT EXISTS public.digital_locker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    document_name TEXT NOT NULL,
    document_type TEXT,
    document_url TEXT NOT NULL,
    
    tags TEXT[],
    description TEXT,
    
    category TEXT,
    
    is_public BOOLEAN DEFAULT false,
    shared_with UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 7: APPOINTMENTS & SCHEDULING
-- ================================================================

-- 7.1 APPOINTMENTS (Enhanced)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    appointment_type TEXT DEFAULT 'consultation',
    meeting_mode TEXT DEFAULT 'online',
    
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT,
    location_address TEXT,
    
    status TEXT DEFAULT 'scheduled',
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    reminder_timestamps TIMESTAMPTZ[],
    
    -- Recording
    recording_url TEXT,
    recording_duration INTEGER,
    
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    feedback JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_ca ON public.appointments(ca_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);

-- 7.2 CA AVAILABILITY
CREATE TABLE IF NOT EXISTS public.ca_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    specific_date DATE,
    is_available BOOLEAN DEFAULT true,
    
    is_recurring BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 8: PAYMENTS & BILLING (Enhanced)
-- ================================================================

-- 8.1 INVOICES (Enhanced)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    status TEXT DEFAULT 'draft',
    
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    description TEXT,
    notes TEXT,
    terms TEXT,
    
    -- GST Details
    gst_number TEXT,
    gst_rate DECIMAL(5,2),
    
    -- Payment Links
    payment_link TEXT,
    razorpay_invoice_id TEXT,
    
    -- Reminders
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_ca ON public.invoices(ca_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- 8.2 INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.3 PAYMENTS (Enhanced)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    
    stripe_payment_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    transaction_id TEXT,
    
    status TEXT DEFAULT 'pending',
    
    -- UPI
    upi_id TEXT,
    
    -- Bank
    bank_account_number TEXT,
    bank_ifsc TEXT,
    
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.4 PAYMENT REMINDERS
CREATE TABLE IF NOT EXISTS public.payment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    
    reminder_type TEXT, -- auto, manual
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.5 SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    
    monthly_price DECIMAL(12,2),
    yearly_price DECIMAL(12,2),
    billing_cycle TEXT DEFAULT 'monthly',
    
    status TEXT DEFAULT 'active',
    
    razorpay_subscription_id TEXT,
    
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    
    auto_renew BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 9: REVIEWS & RATINGS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.ca_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    title TEXT,
    comment TEXT,
    
    ca_response TEXT,
    ca_responded_at TIMESTAMPTZ,
    
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, case_id)
);

-- ================================================================
-- SECTION 10: CHAT & MESSAGING
-- ================================================================

-- 10.1 CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    participant_ids UUID[] NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    type TEXT DEFAULT 'direct',
    title TEXT,
    
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    
    content TEXT,
    message_type TEXT DEFAULT 'text',
    
    attachments JSONB DEFAULT '[]',
    
    reply_to_id UUID REFERENCES public.messages(id),
    
    read_by UUID[] DEFAULT '{}',
    
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- 10.3 CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    UNIQUE(conversation_id, user_id)
);

-- ================================================================
-- SECTION 11: NOTIFICATIONS (Enhanced)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    category TEXT,
    
    action_url TEXT,
    action_label TEXT,
    
    entity_type TEXT,
    entity_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    
    email_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ================================================================
-- SECTION 12: COMPLIANCE & TAX DEADLINES (Enhanced)
-- ================================================================

-- 12.1 COMPLIANCE DEADLINES
CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    deadline_type TEXT NOT NULL,
    
    due_date DATE NOT NULL,
    
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    
    reminder_days INTEGER[] DEFAULT '{7, 3, 1}',
    
    -- Auto-tracking
    is_automated BOOLEAN DEFAULT false,
    automation_rule_id UUID,
    
    -- Links
    related_document_id UUID REFERENCES public.documents(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_deadline_due ON public.compliance_deadlines(due_date);

-- 12.2 COMPLIANCE AUTOMATION RULES
CREATE TABLE IF NOT EXISTS public.compliance_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    rule_name TEXT NOT NULL,
    description TEXT,
    
    compliance_type TEXT NOT NULL,
    
    trigger_condition JSONB NOT NULL,
    action_type TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12.3 COMPLIANCE CALENDAR (Master)
CREATE TABLE IF NOT EXISTS public.compliance_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    compliance_type TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    
    -- For India
    due_date DATE NOT NULL,
    extension_due_date DATE,
    
    description TEXT,
    requirements JSONB DEFAULT '{}',
    
    is_recurring BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 13: TAX FORMS & TEMPLATES
-- ================================================================

-- 13.1 TAX FORM TEMPLATES
CREATE TABLE IF NOT EXISTS public.tax_form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    form_code TEXT UNIQUE NOT NULL, -- ITR-1, ITR-2, GST-3B, etc.
    form_name TEXT NOT NULL,
    description TEXT,
    
    country TEXT DEFAULT 'IN',
    category TEXT, -- Income Tax, GST, TDS, etc.
    
    financial_year_from INTEGER,
    financial_year_to INTEGER,
    
    required_documents JSONB DEFAULT '[]',
    field_mappings JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13.2 CLIENT TAX FORMS
CREATE TABLE IF NOT EXISTS public.client_tax_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.tax_form_templates(id),
    case_id UUID REFERENCES public.cases(id),
    
    form_code TEXT NOT NULL,
    form_name TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    
    form_data JSONB DEFAULT '{}',
    submitted_data JSONB DEFAULT '{}',
    
    status TEXT DEFAULT 'draft',
    
    completion_percentage INTEGER DEFAULT 0,
    missing_fields TEXT[],
    
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 14: ANALYTICS & REPORTING (New)
-- ================================================================

-- 14.1 CASE ANALYTICS
CREATE TABLE IF NOT EXISTS public.case_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Timeline metrics
    created_date DATE NOT NULL,
    started_date DATE,
    completed_date DATE,
    
    days_to_start INTEGER,
    days_to_complete INTEGER,
    
    -- Activity metrics
    total_messages INTEGER DEFAULT 0,
    total_documents_uploaded INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    
    -- Financial metrics
    quoted_amount DECIMAL(12,2),
    final_amount DECIMAL(12,2),
    actual_hours_spent DECIMAL(10,2),
    
    -- Satisfaction
    client_rating DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14.2 CA PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS public.ca_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL,
    
    -- Workload
    active_cases INTEGER DEFAULT 0,
    completed_cases_today INTEGER DEFAULT 0,
    avg_case_duration_days DECIMAL(10,2),
    
    -- Response time
    avg_response_time_hours DECIMAL(10,2),
    response_rate_percentage DECIMAL(5,2),
    
    -- Quality
    average_rating DECIMAL(3,2),
    repeat_client_rate DECIMAL(5,2),
    
    -- Revenue
    daily_revenue DECIMAL(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14.3 CLIENT ENGAGEMENT ANALYTICS
CREATE TABLE IF NOT EXISTS public.client_engagement_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL,
    
    total_cas_connected INTEGER DEFAULT 0,
    active_cases INTEGER DEFAULT 0,
    completed_cases INTEGER DEFAULT 0,
    
    documents_uploaded INTEGER DEFAULT 0,
    appointments_scheduled INTEGER DEFAULT 0,
    
    last_activity_date DATE,
    engagement_score DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 15: SUPPORT & FEEDBACK
-- ================================================================

-- 15.1 SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE,
    
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.users(id),
    
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    
    status TEXT DEFAULT 'open',
    
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15.2 FEEDBACK FORMS
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    feedback_type TEXT NOT NULL, -- feature_request, bug_report, suggestion
    title TEXT NOT NULL,
    description TEXT,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    attachments JSONB DEFAULT '[]',
    
    status TEXT DEFAULT 'open',
    admin_response TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 16: MULTI-LANGUAGE SUPPORT
-- ================================================================

CREATE TABLE IF NOT EXISTS public.translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    language_code TEXT NOT NULL,
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(language_code, namespace, key)
);

-- ================================================================
-- SECTION 17: AUDIT LOGS & ACTIVITY
-- ================================================================

-- 17.1 ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- 17.2 DATA BACKUPS LOG
CREATE TABLE IF NOT EXISTS public.backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    backup_type TEXT NOT NULL,
    backup_size INTEGER,
    backup_url TEXT,
    
    status TEXT DEFAULT 'completed',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 18: INTEGRATIONS
-- ================================================================

-- 18.1 CONNECTED ACCOUNTS
CREATE TABLE IF NOT EXISTS public.connected_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    account_id TEXT,
    account_info JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, service_name, account_id)
);

-- 18.2 API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    
    permissions TEXT[] DEFAULT '{}',
    
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 19: BULK OPERATIONS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.bulk_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiated_by UUID REFERENCES public.users(id) NOT NULL,
    
    operation_type TEXT NOT NULL,
    
    total_items INTEGER,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    status TEXT DEFAULT 'pending',
    
    metadata JSONB DEFAULT '{}',
    error_log JSONB DEFAULT '{}',
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 20: BATCH DOCUMENTS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.batch_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES public.users(id) NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    
    batch_name TEXT NOT NULL,
    
    total_documents INTEGER,
    processed_documents INTEGER DEFAULT 0,
    
    status TEXT DEFAULT 'processing',
    
    documents_mapping JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 21: FUNCTIONS & TRIGGERS
-- ================================================================

-- 21.1 Function to update case_activities when case status changes
CREATE OR REPLACE FUNCTION update_case_activity_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.case_activities (case_id, user_id, activity_type, title, description)
        VALUES (
            NEW.id,
            NEW.assigned_to,
            'status_change',
            'Case Status Updated',
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_case_status_change
    AFTER UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_case_activity_on_status_change();

-- 21.2 Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to multiple tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ca_profiles_updated_at BEFORE UPDATE ON ca_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 21.3 Function to generate case_number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(NEXTVAL('case_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

CREATE TRIGGER trigger_generate_case_number
    BEFORE INSERT ON cases
    FOR EACH ROW
    EXECUTE FUNCTION generate_case_number();

-- 21.4 Function to generate invoice_number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                             LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- 21.5 Function to update CA stats
CREATE OR REPLACE FUNCTION update_ca_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ca_profiles SET
        total_clients = (SELECT COUNT(DISTINCT client_id) FROM ca_client_relationships WHERE ca_id = NEW.ca_id AND status = 'accepted'),
        completed_cases = (SELECT COUNT(*) FROM cases WHERE ca_id = NEW.ca_id AND status = 'completed')
    WHERE id = NEW.ca_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ca_stats
    AFTER INSERT OR UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_ca_stats();

-- ================================================================
-- SECTION 22: INDEXES FOR PERFORMANCE
-- ================================================================

-- Additional strategic indexes
CREATE INDEX idx_cases_created_desc ON public.cases(created_at DESC);
CREATE INDEX idx_invoices_created_desc ON public.invoices(created_at DESC);
CREATE INDEX idx_compliance_deadlines_status ON public.compliance_deadlines(status);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_consultation_modes ON public.ca_profiles USING GIN(consultation_modes);
CREATE INDEX idx_search_keywords ON public.ca_profiles USING GIN(search_keywords);

-- ================================================================
-- SECTION 23: VIEWS FOR EASIER QUERYING
-- ================================================================

-- 23.1 Active Cases View
CREATE OR REPLACE VIEW active_cases_view AS
SELECT 
    c.id,
    c.case_number,
    c.title,
    c.status,
    c.priority,
    cp.first_name || ' ' || cp.last_name as ca_name,
    clp.first_name || ' ' || clp.last_name as client_name,
    c.deadline,
    c.final_amount,
    c.created_at
FROM cases c
JOIN ca_profiles cp ON c.ca_id = cp.id
JOIN client_profiles clp ON c.client_id = clp.id
WHERE c.status != 'completed' AND c.status != 'cancelled';

-- 23.2 CA Performance View
CREATE OR REPLACE VIEW ca_performance_view AS
SELECT 
    cp.id,
    cp.display_name,
    cp.average_rating,
    COUNT(DISTINCT c.id) as total_cases,
    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_cases,
    ROUND(100.0 * COUNT(CASE WHEN c.status = 'completed' THEN 1 END) / 
          NULLIF(COUNT(DISTINCT c.id), 0), 2) as completion_rate,
    COUNT(DISTINCT ccr.client_id) as total_clients
FROM ca_profiles cp
LEFT JOIN cases c ON cp.id = c.ca_id
LEFT JOIN ca_client_relationships ccr ON cp.id = ccr.ca_id AND ccr.status = 'accepted'
GROUP BY cp.id, cp.display_name, cp.average_rating;

-- 23.3 Revenue View
CREATE OR REPLACE VIEW revenue_view AS
SELECT 
    DATE_TRUNC('month', i.issue_date) as month,
    SUM(i.total_amount) as total_revenue,
    COUNT(DISTINCT i.id) as invoice_count,
    COUNT(DISTINCT i.ca_id) as ca_count
FROM invoices i
WHERE i.status IN ('paid', 'partially_paid')
GROUP BY DATE_TRUNC('month', i.issue_date);

-- 23.4 Pending Deadlines View
CREATE OR REPLACE VIEW pending_deadlines_view AS
SELECT 
    cd.id,
    cd.title,
    cd.deadline_type,
    cd.due_date,
    CURRENT_DATE,
    (cd.due_date - CURRENT_DATE) as days_until_due,
    u.email as responsible_person_email,
    cd.status
FROM compliance_deadlines cd
LEFT JOIN public.users u ON cd.user_id = u.id
WHERE cd.status = 'pending' AND cd.due_date >= CURRENT_DATE
ORDER BY cd.due_date ASC;

-- ================================================================
-- SECTION 24: INITIAL DATA
-- ================================================================

-- 24.1 Service Types
INSERT INTO public.service_types (code, name, description, category, compliance_type, compliance_frequency) VALUES
('ITR_FILING', 'Income Tax Return Filing', 'Complete ITR filing and submission', 'Tax', 'ITR', 'annual'),
('GST_REGISTRATION', 'GST Registration', 'GST business registration and compliance setup', 'Compliance', 'GST_REG', 'once'),
('GST_RETURN', 'GST Return Filing', 'Monthly/Quarterly GST return filing', 'Tax', 'GST_RETURN', 'monthly'),
('TDS_PAYMENT', 'TDS Payment & Certificate', 'TDS deduction and payment processing', 'Tax', 'TDS', 'quarterly'),
('AUDIT', 'Financial Audit', 'Complete financial and statutory audit', 'Audit', 'AUDIT', 'annual'),
('PAYROLL', 'Payroll Management', 'Complete payroll processing and compliance', 'HR', 'PAYROLL', 'monthly'),
('BANK_RECONCILIATION', 'Bank Reconciliation', 'Monthly bank reconciliation services', 'Accounting', 'BANK_RECON', 'monthly'),
('BOOKKEEPING', 'Bookkeeping Services', 'Professional bookkeeping and accounting', 'Accounting', 'BOOKKEEPING', 'monthly'),
('BUSINESS_SETUP', 'Business Setup', 'Company registration and setup', 'Compliance', 'BUSINESS_SETUP', 'once'),
('COMPLIANCE_CALENDAR', 'Compliance Calendar', 'Year-round compliance tracking', 'Compliance', 'COMPLIANCE', 'continuous'),
('FINANCIAL_PLANNING', 'Financial Planning', 'Personal and business financial planning', 'Advisory', 'PLANNING', 'varies'),
('TAX_OPTIMIZATION', 'Tax Optimization', 'Tax planning and optimization strategies', 'Advisory', 'TAX_OPT', 'annual')
ON CONFLICT DO NOTHING;

-- 24.2 Compliance Calendar
INSERT INTO public.compliance_calendar (compliance_type, financial_year, due_date, extension_due_date, description) VALUES
('ITR', '2024-25', '2025-07-31', '2025-10-31', 'Income Tax Return Filing'),
('GST_RETURN', '2024-25', '2025-01-31', NULL, 'GST Return Filing (Monthly)'),
('TDS', '2024-25', '2025-04-30', NULL, 'TDS Deduction and Payment'),
('AUDIT', '2024-25', '2025-09-30', NULL, 'Statutory Audit Report'),
('PAYROLL', '2024-25', '2025-12-31', NULL, 'Annual Payroll Compliance')
ON CONFLICT DO NOTHING;

-- ================================================================
-- SECTION 25: PERMISSIONS & SECURITY
-- ================================================================

-- Enable row-level security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- USERS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- ================================================================
-- CA PROFILES POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Public can view verified CA profiles" ON public.ca_profiles;
CREATE POLICY "Public can view verified CA profiles" ON public.ca_profiles
    FOR SELECT USING (verification_status = 'verified' OR user_id = auth.uid());

DROP POLICY IF EXISTS "CAs can update own profile" ON public.ca_profiles;
CREATE POLICY "CAs can update own profile" ON public.ca_profiles
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "CAs can insert own profile" ON public.ca_profiles;
CREATE POLICY "CAs can insert own profile" ON public.ca_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ================================================================
-- CLIENT PROFILES POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Clients can view own profile" ON public.client_profiles;
CREATE POLICY "Clients can view own profile" ON public.client_profiles
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Clients can update own profile" ON public.client_profiles;
CREATE POLICY "Clients can update own profile" ON public.client_profiles
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Clients can insert own profile" ON public.client_profiles;
CREATE POLICY "Clients can insert own profile" ON public.client_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ================================================================
-- CASES POLICIES
-- ================================================================

DROP POLICY IF EXISTS "CAs can view assigned cases" ON public.cases;
CREATE POLICY "CAs can view assigned cases" ON public.cases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = cases.ca_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Clients can view own cases" ON public.cases;
CREATE POLICY "Clients can view own cases" ON public.cases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM client_profiles WHERE id = cases.client_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
CREATE POLICY "Users can update own cases" ON public.cases
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = cases.ca_id AND user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM client_profiles WHERE id = cases.client_id AND user_id = auth.uid())
    );

-- ================================================================
-- DOCUMENTS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view accessible documents" ON public.documents;
CREATE POLICY "Users can view accessible documents" ON public.documents
    FOR SELECT USING (
        uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM cases c
            JOIN ca_profiles cp ON cp.id = c.ca_id
            WHERE c.id = documents.case_id AND cp.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM cases c
            JOIN client_profiles clp ON clp.id = c.client_id
            WHERE c.id = documents.case_id AND clp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
CREATE POLICY "Users can upload documents" ON public.documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- ================================================================
-- NOTIFICATIONS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ================================================================
-- MESSAGES POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.messages;
CREATE POLICY "Users can view own conversations" ON public.messages
    FOR SELECT USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can post messages" ON public.messages;
CREATE POLICY "Users can post messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ================================================================
-- SECTION 26: SCHEMA COMPLETION
-- ================================================================

COMMIT;
