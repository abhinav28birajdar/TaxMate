-- ================================================================
-- TAXMATE - COMPLETE PRODUCTION DATABASE SCHEMA
-- ================================================================
-- 
-- This is the final, production-ready schema for TaxMate.
-- 
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run" to execute
--
-- ================================================================

-- ================================================================
-- SECTION 1: EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ================================================================
-- SECTION 2: DROP EXISTING TABLES (Clean Install)
-- ================================================================

-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.realtime_logs CASCADE;
DROP TABLE IF EXISTS public.saved_cas CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.typing_indicators CASCADE;
DROP TABLE IF EXISTS public.message_read_receipts CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.document_permissions CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.case_timeline CASCADE;
DROP TABLE IF EXISTS public.case_tasks CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.ca_client_relationships CASCADE;
DROP TABLE IF EXISTS public.ca_availability CASCADE;
DROP TABLE IF EXISTS public.ca_industries CASCADE;
DROP TABLE IF EXISTS public.ca_specializations CASCADE;
DROP TABLE IF EXISTS public.ca_services CASCADE;
DROP TABLE IF EXISTS public.firm_profiles CASCADE;
DROP TABLE IF EXISTS public.client_profiles CASCADE;
DROP TABLE IF EXISTS public.ca_profiles CASCADE;
DROP TABLE IF EXISTS public.user_presence CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ================================================================
-- SECTION 3: CORE TABLES
-- ================================================================

-- 3.1 ROLES TABLE (RBAC)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 PERMISSIONS TABLE (RBAC)
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 USERS TABLE (Core Identity - extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'ca', 'firm', 'admin')),
    role_id UUID REFERENCES public.roles(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated', 'pending_onboarding', 'pending_verification')),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.4 USER PRESENCE (Real-time status tracking)
CREATE TABLE public.user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    current_page TEXT,
    device_info JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 CA PROFILES (Chartered Accountants)
CREATE TABLE public.ca_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    tagline TEXT,
    bio TEXT,
    
    -- Professional Details
    icai_membership_number TEXT UNIQUE,
    cop_number TEXT,
    firm_name TEXT,
    designation TEXT,
    years_of_experience INTEGER DEFAULT 0,
    qualification TEXT,
    
    -- Location & Contact
    office_address JSONB DEFAULT '{}',
    service_locations TEXT[],
    consultation_modes TEXT[] DEFAULT ARRAY['online'],
    working_hours JSONB DEFAULT '{}',
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    is_accepting_clients BOOLEAN DEFAULT true,
    max_active_cases INTEGER DEFAULT 50,
    
    -- Verification
    verification_status TEXT DEFAULT 'unverified' CHECK (
        verification_status IN ('unverified', 'pending', 'under_review', 'verified', 'rejected')
    ),
    verification_documents JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    
    -- Stats (Denormalized for performance)
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    active_cases INTEGER DEFAULT 0,
    completed_cases INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 100.00,
    avg_response_time INTEGER DEFAULT 0,
    
    -- Premium Features
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    featured_until TIMESTAMPTZ,
    
    -- SEO & Discovery
    slug TEXT UNIQUE,
    search_keywords TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.6 CLIENT PROFILES
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    
    -- Tax & Legal
    pan_number TEXT,
    tax_id TEXT,
    gstin TEXT,
    
    -- Contact & Address
    address JSONB DEFAULT '{}',
    alternate_phone TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'English',
    communication_preference TEXT DEFAULT 'email' CHECK (
        communication_preference IN ('email', 'phone', 'whatsapp', 'in_app')
    ),
    
    -- Business Info (if applicable)
    is_business BOOLEAN DEFAULT false,
    business_name TEXT,
    business_type TEXT,
    
    -- Stats
    total_cases INTEGER DEFAULT 0,
    active_cases INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.7 FIRM PROFILES (CA Firms)
CREATE TABLE public.firm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Firm Info
    firm_name TEXT NOT NULL,
    firm_registration_number TEXT UNIQUE,
    established_year INTEGER,
    
    -- Contact
    website TEXT,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}',
    
    -- Details
    description TEXT,
    team_size INTEGER DEFAULT 1,
    service_areas TEXT[],
    
    -- Premium
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    
    -- Stats
    total_cas INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ================================================================
-- SECTION 4: CA SERVICE TABLES
-- ================================================================

-- 4.1 CA SERVICES
CREATE TABLE public.ca_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    service_type TEXT NOT NULL CHECK (service_type IN (
        'ITR_FILING', 'GST_REGISTRATION', 'GST_FILING', 'TDS_COMPLIANCE', 
        'AUDIT', 'ROC_COMPLIANCE', 'ACCOUNTING', 'TAX_PLANNING', 
        'FINANCIAL_ADVISORY', 'STARTUP_COMPLIANCE', 'CONSULTATION', 'OTHER'
    )),
    
    sub_category TEXT,
    name TEXT,
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

-- 4.2 CA SPECIALIZATIONS
CREATE TABLE public.ca_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    specialization TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 CA INDUSTRIES
CREATE TABLE public.ca_industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    industry TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 CA AVAILABILITY
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

-- ================================================================
-- SECTION 5: RELATIONSHIP & CASE TABLES
-- ================================================================

-- 5.1 CA-CLIENT RELATIONSHIPS
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
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ca_id, client_id)
);

-- 5.2 CASES
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

-- 5.3 CASE TASKS
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

-- 5.4 CASE TIMELINE
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

-- ================================================================
-- SECTION 6: DOCUMENT TABLES
-- ================================================================

-- 6.1 DOCUMENTS
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 6.2 DOCUMENT PERMISSIONS
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

-- ================================================================
-- SECTION 7: COMMUNICATION TABLES
-- ================================================================

-- 7.1 CONVERSATIONS
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    participant_ids UUID[] NOT NULL,
    
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    title TEXT,
    is_group BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_preview TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 MESSAGES
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    
    sender_id UUID REFERENCES public.users(id) NOT NULL,
    
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'image', 'voice')),
    content TEXT,
    
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    
    reply_to_id UUID REFERENCES public.messages(id),
    
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7.3 MESSAGE READ RECEIPTS
CREATE TABLE public.message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

-- 7.4 TYPING INDICATORS
CREATE TABLE public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_typing BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(conversation_id, user_id)
);

-- ================================================================
-- SECTION 8: APPOINTMENT & PAYMENT TABLES
-- ================================================================

-- 8.1 APPOINTMENTS
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
    mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'offline', 'phone')),
    
    location TEXT,
    meeting_link TEXT,
    meeting_password TEXT,
    
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show'
    )),
    
    title TEXT,
    notes TEXT,
    
    reminder_sent BOOLEAN DEFAULT false,
    
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 PAYMENTS
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id TEXT UNIQUE NOT NULL,
    
    payer_id UUID REFERENCES public.users(id) NOT NULL,
    payee_id UUID REFERENCES public.users(id) NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    payment_gateway TEXT CHECK (payment_gateway IN ('razorpay', 'stripe', 'manual', 'bank_transfer')),
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.3 INVOICES
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
    
    line_items JSONB NOT NULL DEFAULT '[]',
    
    notes TEXT,
    terms TEXT,
    
    pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 9: REVIEW & NOTIFICATION TABLES
-- ================================================================

-- 9.1 REVIEWS
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

-- 9.2 NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    type TEXT NOT NULL CHECK (type IN (
        'info', 'success', 'warning', 'error', 'reminder',
        'new_message', 'new_client_request', 'case_update', 'appointment_reminder',
        'payment_received', 'document_uploaded', 'review_received', 'deadline_approaching',
        'connection_accepted', 'connection_rejected', 'system'
    )),
    
    title TEXT NOT NULL,
    message TEXT,
    
    category TEXT,
    action_url TEXT,
    action_label TEXT,
    
    entity_type TEXT,
    entity_id TEXT,
    
    related_user_id UUID REFERENCES public.users(id),
    case_id UUID REFERENCES public.cases(id),
    conversation_id UUID REFERENCES public.conversations(id),
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.3 NOTIFICATION PREFERENCES
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
        "payment_received": {"email": true, "sms": false, "push": true},
        "deadline_approaching": {"email": true, "sms": true, "push": true}
    }',
    
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 10: ADDITIONAL TABLES
-- ================================================================

-- 10.1 SAVED CAs (Favorites)
CREATE TABLE public.saved_cas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, ca_id)
);

-- 10.2 SUBSCRIPTIONS
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
    
    features JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.3 ACTIVITY LOGS (For audit trail)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.4 REALTIME LOGS (For realtime event tracking)
CREATE TABLE public.realtime_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    event_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    payload JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 11: INDEXES
-- ================================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_created ON public.users(created_at DESC);

-- User Presence
CREATE INDEX idx_presence_user ON public.user_presence(user_id);
CREATE INDEX idx_presence_status ON public.user_presence(status);

-- CA Profiles
CREATE INDEX idx_ca_profiles_user_id ON public.ca_profiles(user_id);
CREATE INDEX idx_ca_profiles_verification ON public.ca_profiles(verification_status);
CREATE INDEX idx_ca_profiles_slug ON public.ca_profiles(slug);
CREATE INDEX idx_ca_profiles_premium ON public.ca_profiles(is_premium);
CREATE INDEX idx_ca_profiles_available ON public.ca_profiles(is_available);
CREATE INDEX idx_ca_profiles_rating ON public.ca_profiles(average_rating DESC);
CREATE INDEX idx_ca_profiles_search ON public.ca_profiles USING GIN(search_keywords);

-- Client Profiles
CREATE INDEX idx_client_profiles_user_id ON public.client_profiles(user_id);

-- Firm Profiles
CREATE INDEX idx_firm_profiles_user_id ON public.firm_profiles(user_id);

-- CA Services
CREATE INDEX idx_ca_services_ca ON public.ca_services(ca_id);
CREATE INDEX idx_ca_services_type ON public.ca_services(service_type);
CREATE INDEX idx_ca_services_active ON public.ca_services(is_active);

-- Relationships
CREATE INDEX idx_relationships_ca ON public.ca_client_relationships(ca_id);
CREATE INDEX idx_relationships_client ON public.ca_client_relationships(client_id);
CREATE INDEX idx_relationships_status ON public.ca_client_relationships(status);

-- Cases
CREATE INDEX idx_cases_ca ON public.cases(ca_id);
CREATE INDEX idx_cases_client ON public.cases(client_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_priority ON public.cases(priority);
CREATE INDEX idx_cases_deadline ON public.cases(deadline);
CREATE INDEX idx_cases_number ON public.cases(case_number);
CREATE INDEX idx_cases_created ON public.cases(created_at DESC);

-- Case Tasks
CREATE INDEX idx_tasks_case ON public.case_tasks(case_id);
CREATE INDEX idx_tasks_assigned ON public.case_tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.case_tasks(status);

-- Documents
CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_type ON public.documents(document_type);

-- Conversations
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN(participant_ids);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversations_case ON public.conversations(case_id);

-- Messages
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Appointments
CREATE INDEX idx_appointments_ca ON public.appointments(ca_id);
CREATE INDEX idx_appointments_client ON public.appointments(client_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Payments
CREATE INDEX idx_payments_payer ON public.payments(payer_id);
CREATE INDEX idx_payments_payee ON public.payments(payee_id);
CREATE INDEX idx_payments_case ON public.payments(case_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Invoices
CREATE INDEX idx_invoices_ca ON public.invoices(ca_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Reviews
CREATE INDEX idx_reviews_ca ON public.reviews(ca_id);
CREATE INDEX idx_reviews_published ON public.reviews(is_published);

-- Activity Logs
CREATE INDEX idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_action ON public.activity_logs(action);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);

-- ================================================================
-- SECTION 12: ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- SECTION 13: RLS POLICIES
-- ================================================================

-- USERS POLICIES
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- USER PRESENCE POLICIES
CREATE POLICY "Users can view all presence" ON public.user_presence
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own presence" ON public.user_presence
    FOR ALL USING (user_id = auth.uid());

-- CA PROFILES POLICIES (Public for discovery)
CREATE POLICY "CA profiles are viewable by everyone" ON public.ca_profiles
    FOR SELECT USING (true);

CREATE POLICY "CAs can update own profile" ON public.ca_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "CAs can insert own profile" ON public.ca_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CLIENT PROFILES POLICIES
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

-- FIRM PROFILES POLICIES
CREATE POLICY "Firm profiles are viewable by authenticated" ON public.firm_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Firms can manage own profile" ON public.firm_profiles
    FOR ALL USING (auth.uid() = user_id);

-- CA SERVICES POLICIES
CREATE POLICY "CA services are viewable by everyone" ON public.ca_services
    FOR SELECT USING (true);

CREATE POLICY "CAs can manage own services" ON public.ca_services
    FOR ALL USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- CA SPECIALIZATIONS POLICIES
CREATE POLICY "Specializations are viewable by everyone" ON public.ca_specializations
    FOR SELECT USING (true);

CREATE POLICY "CAs can manage own specializations" ON public.ca_specializations
    FOR ALL USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- CA INDUSTRIES POLICIES
CREATE POLICY "Industries are viewable by everyone" ON public.ca_industries
    FOR SELECT USING (true);

CREATE POLICY "CAs can manage own industries" ON public.ca_industries
    FOR ALL USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- CA AVAILABILITY POLICIES
CREATE POLICY "Availability viewable by authenticated" ON public.ca_availability
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "CAs can manage own availability" ON public.ca_availability
    FOR ALL USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- RELATIONSHIPS POLICIES
CREATE POLICY "Users can view own relationships" ON public.ca_client_relationships
    FOR SELECT USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert relationships" ON public.ca_client_relationships
    FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can update own relationships" ON public.ca_client_relationships
    FOR UPDATE USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    );

-- CASES POLICIES
CREATE POLICY "Users can view own cases" ON public.cases
    FOR SELECT USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
        OR assigned_to = auth.uid()
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

-- CASE TASKS POLICIES
CREATE POLICY "Users can view tasks for own cases" ON public.case_tasks
    FOR SELECT USING (
        case_id IN (SELECT id FROM public.cases WHERE 
            ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
            OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "CAs can manage tasks" ON public.case_tasks
    FOR ALL USING (
        case_id IN (SELECT id FROM public.cases WHERE 
            ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        )
    );

-- CASE TIMELINE POLICIES
CREATE POLICY "Users can view timeline for own cases" ON public.case_timeline
    FOR SELECT USING (
        case_id IN (SELECT id FROM public.cases WHERE 
            ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
            OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert timeline events" ON public.case_timeline
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- DOCUMENTS POLICIES
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (
        uploaded_by = auth.uid()
        OR ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
        OR case_id IN (SELECT id FROM public.cases WHERE 
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

-- DOCUMENT PERMISSIONS POLICIES
CREATE POLICY "Users can view own permissions" ON public.document_permissions
    FOR SELECT USING (user_id = auth.uid() OR granted_by = auth.uid());

CREATE POLICY "Document owners can grant permissions" ON public.document_permissions
    FOR INSERT WITH CHECK (
        document_id IN (SELECT id FROM public.documents WHERE uploaded_by = auth.uid())
    );

-- CONVERSATIONS POLICIES
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- MESSAGES POLICIES
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

-- MESSAGE READ RECEIPTS POLICIES
CREATE POLICY "Users can manage own read receipts" ON public.message_read_receipts
    FOR ALL USING (user_id = auth.uid());

-- TYPING INDICATORS POLICIES
CREATE POLICY "Users can manage own typing" ON public.typing_indicators
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view typing in own conversations" ON public.typing_indicators
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)
        )
    );

-- APPOINTMENTS POLICIES
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

-- PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "Users can create payments" ON public.payments
    FOR INSERT WITH CHECK (payer_id = auth.uid());

-- INVOICES POLICIES
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
        OR client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "CAs can manage invoices" ON public.invoices
    FOR ALL USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- REVIEWS POLICIES
CREATE POLICY "Published reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (is_published = true);

CREATE POLICY "Clients can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "CAs can respond to reviews" ON public.reviews
    FOR UPDATE USING (
        ca_id IN (SELECT id FROM public.ca_profiles WHERE user_id = auth.uid())
    );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- NOTIFICATION PREFERENCES POLICIES
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- SAVED CAS POLICIES
CREATE POLICY "Users can manage saved CAs" ON public.saved_cas
    FOR ALL USING (
        client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
    );

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- REALTIME LOGS POLICIES
CREATE POLICY "Admins can view realtime logs" ON public.realtime_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "System can insert realtime logs" ON public.realtime_logs
    FOR INSERT WITH CHECK (true);

-- ROLES AND PERMISSIONS POLICIES (Admin only)
CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ================================================================
-- SECTION 14: FUNCTIONS & TRIGGERS
-- ================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ca_profiles_updated_at BEFORE UPDATE ON public.ca_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_profiles_updated_at BEFORE UPDATE ON public.firm_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, role, status)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'ca' THEN 'pending_onboarding'
            WHEN NEW.raw_user_meta_data->>'role' = 'firm' THEN 'pending_onboarding'
            ELSE 'active'
        END
    );

    -- Create role-specific profile
    IF (NEW.raw_user_meta_data->>'role' = 'ca') THEN
        INSERT INTO public.ca_profiles (user_id, first_name, last_name, display_name, slug)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'User') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            'ca-' || LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'first_name', 'user'), ' ', '-')) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
        );
    ELSIF (NEW.raw_user_meta_data->>'role' = 'firm') THEN
        INSERT INTO public.firm_profiles (user_id, firm_name)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'firm_name', 'My Firm')
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

-- Generate payment ID
CREATE OR REPLACE FUNCTION generate_payment_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payment_id := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_id BEFORE INSERT ON public.payments
    FOR EACH ROW WHEN (NEW.payment_id IS NULL)
    EXECUTE FUNCTION generate_payment_id();

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
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) FROM public.reviews 
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

-- Log case status change
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

-- Update CA client count
CREATE OR REPLACE FUNCTION update_ca_client_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE public.ca_profiles
        SET total_clients = total_clients + 1
        WHERE id = NEW.ca_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        UPDATE public.ca_profiles
        SET total_clients = total_clients + 1
        WHERE id = NEW.ca_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status = 'terminated' THEN
        UPDATE public.ca_profiles
        SET total_clients = GREATEST(total_clients - 1, 0)
        WHERE id = NEW.ca_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_relationship_change AFTER INSERT OR UPDATE ON public.ca_client_relationships
    FOR EACH ROW EXECUTE FUNCTION update_ca_client_count();

-- Update CA case counts
CREATE OR REPLACE FUNCTION update_ca_case_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update active cases count
    UPDATE public.ca_profiles
    SET 
        active_cases = (
            SELECT COUNT(*) FROM public.cases 
            WHERE ca_id = NEW.ca_id 
            AND status NOT IN ('completed', 'cancelled')
        ),
        completed_cases = (
            SELECT COUNT(*) FROM public.cases 
            WHERE ca_id = NEW.ca_id 
            AND status = 'completed'
        )
    WHERE id = NEW.ca_id;
    
    -- Update client's case counts too
    UPDATE public.client_profiles
    SET 
        active_cases = (
            SELECT COUNT(*) FROM public.cases 
            WHERE client_id = NEW.client_id 
            AND status NOT IN ('completed', 'cancelled')
        ),
        total_cases = (
            SELECT COUNT(*) FROM public.cases 
            WHERE client_id = NEW.client_id
        )
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_case_change AFTER INSERT OR UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_ca_case_count();

-- ================================================================
-- SECTION 15: REALTIME CONFIGURATION
-- ================================================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- ================================================================
-- SECTION 16: SEED DATA (Default Roles)
-- ================================================================

INSERT INTO public.roles (name, description, is_system, permissions) VALUES
    ('admin', 'Full system administrator', true, '{"all": true}'),
    ('ca', 'Chartered Accountant', true, '{"cases": {"create": true, "read": true, "update": true}, "clients": {"read": true}}'),
    ('client', 'Regular client', true, '{"cases": {"read": true}, "documents": {"create": true, "read": true}}'),
    ('firm', 'CA Firm', true, '{"cases": {"create": true, "read": true, "update": true}, "team": {"manage": true}}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name, description, resource, action) VALUES
    ('cases.create', 'Create new cases', 'cases', 'create'),
    ('cases.read', 'Read cases', 'cases', 'read'),
    ('cases.update', 'Update cases', 'cases', 'update'),
    ('cases.delete', 'Delete cases', 'cases', 'delete'),
    ('clients.read', 'Read client data', 'clients', 'read'),
    ('clients.manage', 'Manage clients', 'clients', 'manage'),
    ('documents.create', 'Upload documents', 'documents', 'create'),
    ('documents.read', 'Read documents', 'documents', 'read'),
    ('documents.delete', 'Delete documents', 'documents', 'delete'),
    ('team.manage', 'Manage team members', 'team', 'manage'),
    ('billing.manage', 'Manage billing', 'billing', 'manage'),
    ('admin.full', 'Full admin access', 'admin', 'full')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- SCHEMA COMPLETE
-- ================================================================
