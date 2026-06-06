-- ================================================================
-- TAXMATE - COMPLETE SUPABASE DATABASE SCHEMA
-- ================================================================
-- 
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run" to execute
--
-- This will create all tables, functions, triggers, and policies
-- needed for the TaxMate application.
-- ================================================================

-- ================================================================
-- SECTION 1: EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ================================================================
-- SECTION 2: CUSTOM TYPES (ENUMS)
-- ================================================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'ca', 'firm', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_onboarding', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verification status
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'under_review', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Case status
DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Case priority
DO $$ BEGIN
    CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Relationship status
DO $$ BEGIN
    CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'rejected', 'terminated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Appointment status
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================================================
-- SECTION 3: CORE TABLES
-- ================================================================

-- 3.1 USERS TABLE (Extends auth.users)
-- This table stores additional user information beyond what Supabase Auth provides
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'ca', 'firm', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated', 'pending_onboarding', 'pending_verification')),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 CA PROFILES
-- Stores detailed information for Chartered Accountants
CREATE TABLE IF NOT EXISTS public.ca_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    tagline TEXT, -- Short description like "Tax Expert | GST Specialist"
    bio TEXT,     -- Detailed bio
    
    -- Professional Details
    icai_membership_number TEXT UNIQUE,
    cop_number TEXT, -- Certificate of Practice number
    firm_name TEXT,
    years_of_experience INTEGER DEFAULT 0,
    qualification TEXT, -- ACA, FCA etc.
    
    -- Location & Contact
    office_address JSONB DEFAULT '{}', -- { street, city, state, zip, country }
    service_locations TEXT[], -- Array of cities/regions
    consultation_modes TEXT[] DEFAULT '{online}', -- online, in-person, hybrid
    working_hours JSONB DEFAULT '{}', -- { monday: {start: "09:00", end: "18:00"}, ... }
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    is_accepting_clients BOOLEAN DEFAULT true,
    max_active_cases INTEGER DEFAULT 50,
    
    -- Verification & Premium
    is_premium BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'under_review', 'verified', 'rejected')),
    verification_documents JSONB DEFAULT '{}', -- { certificate_url, pan_url, id_proof_url }
    verified_at TIMESTAMPTZ,
    
    -- Stats (Denormalized for performance)
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    completed_cases INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 100.00, -- Percentage
    avg_response_time INTEGER DEFAULT 0, -- In minutes
    
    -- SEO & Discovery
    slug TEXT UNIQUE, -- URL-friendly identifier
    search_keywords TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 CLIENT PROFILES
-- Stores detailed information for clients
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    
    -- Tax & Legal
    pan_number TEXT, -- Indian PAN
    tax_id TEXT,     -- Generic tax ID for other countries
    gstin TEXT,      -- GST Identification Number
    
    -- Contact & Address
    address JSONB DEFAULT '{}', -- { street, city, state, zip, country }
    alternate_phone TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'English',
    communication_preference TEXT DEFAULT 'email' CHECK (communication_preference IN ('email', 'phone', 'whatsapp', 'in_app')),
    
    -- Business Info (if applicable)
    is_business BOOLEAN DEFAULT false,
    business_name TEXT,
    business_type TEXT, -- Sole Proprietorship, Partnership, Pvt Ltd, etc.
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 FIRM PROFILES
-- For CA firms with multiple practitioners
CREATE TABLE IF NOT EXISTS public.firm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Firm Info
    firm_name TEXT NOT NULL,
    firm_registration_number TEXT UNIQUE,
    logo_url TEXT,
    description TEXT,
    
    -- Contact
    address JSONB DEFAULT '{}',
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Stats
    total_cas INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    
    -- Verification
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'under_review', 'verified', 'rejected')),
    verification_documents JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 4: CA SERVICES & SPECIALIZATIONS
-- ================================================================

-- 4.1 SERVICE TYPES (Master table)
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- ITR_FILING, GST_REGISTRATION, etc.
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Tax, Compliance, Advisory, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 CA SERVICES (Services offered by each CA)
CREATE TABLE IF NOT EXISTS public.ca_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    service_type_id UUID REFERENCES public.service_types(id),
    service_code TEXT NOT NULL, -- For custom services
    service_name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    max_price DECIMAL(12,2), -- For "starting from" pricing
    currency TEXT DEFAULT 'INR',
    pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'quote', 'range')),
    
    -- Details
    estimated_days INTEGER, -- Estimated completion time
    documents_required TEXT[],
    deliverables TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ca_id, specialization)
);

-- ================================================================
-- SECTION 5: RELATIONSHIPS & CASES
-- ================================================================

-- 5.1 CA-CLIENT RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.ca_client_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'terminated')),
    
    -- Metadata
    requested_by UUID REFERENCES public.users(id),
    request_message TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    connected_at TIMESTAMPTZ, -- When relationship was accepted
    terminated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ca_id, client_id)
);

-- 5.2 CASES
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE, -- Auto-generated friendly ID
    
    -- Participants
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.users(id), -- For firms, specific CA handling the case
    
    -- Case Details
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    financial_year TEXT, -- e.g., "2024-25"
    
    -- Status & Priority
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Financials
    quoted_amount DECIMAL(12,2),
    final_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'INR',
    
    -- Dates
    deadline TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Notes
    internal_notes TEXT, -- CA only
    client_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 CASE ACTIVITIES / TIMELINE
CREATE TABLE IF NOT EXISTS public.case_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    
    activity_type TEXT NOT NULL, -- status_change, document_uploaded, comment, etc.
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    is_visible_to_client BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 6: DOCUMENTS
-- ================================================================

-- 6.1 CASE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.case_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) NOT NULL,
    
    -- File Info
    name TEXT NOT NULL,
    original_name TEXT,
    file_url TEXT NOT NULL,
    file_path TEXT, -- Storage path
    file_type TEXT,
    mime_type TEXT,
    size INTEGER,
    
    -- Metadata
    category TEXT, -- PAN, Form16, BankStatement, etc.
    financial_year TEXT,
    description TEXT,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Access
    is_shared_with_ca BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 7: APPOINTMENTS & CALLS
-- ================================================================

-- 7.1 APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    -- Appointment Details
    title TEXT NOT NULL,
    description TEXT,
    appointment_type TEXT DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'review', 'document_collection', 'signing', 'other')),
    meeting_mode TEXT DEFAULT 'online' CHECK (meeting_mode IN ('online', 'in_person', 'phone')),
    
    -- Timing
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    
    -- Meeting Link (for online)
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT,
    
    -- Location (for in-person)
    location_address TEXT,
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    
    -- Timestamps
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 CA AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS public.ca_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Day & Time
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- For specific dates
    specific_date DATE,
    is_available BOOLEAN DEFAULT true,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 8: PAYMENTS & BILLING
-- ================================================================

-- 8.1 INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    
    -- Parties
    ca_id UUID REFERENCES public.ca_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    
    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    -- Details
    description TEXT,
    notes TEXT,
    terms TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 INVOICE LINE ITEMS
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

-- 8.3 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    
    -- Payment Info
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT, -- card, upi, bank_transfer, cash
    
    -- External References
    stripe_payment_id TEXT,
    razorpay_payment_id TEXT,
    transaction_id TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
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
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Detailed Ratings (optional)
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Review
    title TEXT,
    comment TEXT,
    
    -- CA Response
    ca_response TEXT,
    ca_responded_at TIMESTAMPTZ,
    
    -- Moderation
    is_verified BOOLEAN DEFAULT false, -- Verified purchase/service
    is_published BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, case_id) -- One review per case
);

-- ================================================================
-- SECTION 10: CHAT & MESSAGING
-- ================================================================

-- 10.1 CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants (stored as array for flexibility)
    participant_ids UUID[] NOT NULL,
    
    -- Context
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    -- Conversation Info
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'case', 'support')),
    title TEXT,
    
    -- Last Message Preview
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Content
    content TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system', 'voice')),
    
    -- Attachments
    attachments JSONB DEFAULT '[]', -- [{name, url, type, size}]
    
    -- Reply
    reply_to_id UUID REFERENCES public.messages(id),
    
    -- Read Status
    read_by UUID[] DEFAULT '{}',
    
    -- Status
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.3 CONVERSATION PARTICIPANTS (for read receipts, etc.)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Read tracking
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    
    -- Settings
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Status
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    UNIQUE(conversation_id, user_id)
);

-- ================================================================
-- SECTION 11: NOTIFICATIONS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder')),
    category TEXT, -- case, payment, appointment, message, etc.
    
    -- Action
    action_url TEXT,
    action_label TEXT,
    
    -- Related Entity
    entity_type TEXT, -- case, appointment, invoice, etc.
    entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    
    -- Delivery
    email_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 12: COMPLIANCE CALENDAR
-- ================================================================

CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    
    -- Deadline Info
    title TEXT NOT NULL,
    description TEXT,
    deadline_type TEXT NOT NULL, -- ITR_FILING, GST_RETURN, TDS_PAYMENT, etc.
    
    -- Date
    due_date DATE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'extended')),
    completed_at TIMESTAMPTZ,
    
    -- Reminders
    reminder_days INTEGER[] DEFAULT '{7, 3, 1}', -- Days before due date
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 13: SUPPORT TICKETS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE,
    
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.users(id),
    
    -- Ticket Details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- billing, technical, account, other
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed')),
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 14: ACTIVITY LOGS
-- ================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Activity
    action TEXT NOT NULL, -- login, logout, create, update, delete, etc.
    entity_type TEXT, -- user, case, document, etc.
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SECTION 15: ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ca_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ========================
-- USERS POLICIES
-- ========================

-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- ========================
-- CA PROFILES POLICIES
-- ========================

-- Anyone can view verified CA profiles (for discovery)
CREATE POLICY "Public can view verified CA profiles" ON public.ca_profiles
    FOR SELECT USING (verification_status = 'verified' OR user_id = auth.uid());

-- CAs can update their own profile
CREATE POLICY "CAs can update own profile" ON public.ca_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- CAs can insert their own profile
CREATE POLICY "CAs can insert own profile" ON public.ca_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================
-- CLIENT PROFILES POLICIES
-- ========================

-- Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON public.client_profiles
    FOR SELECT USING (user_id = auth.uid());

-- CAs can view profiles of their connected clients
CREATE POLICY "CAs can view connected client profiles" ON public.client_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ca_client_relationships ccr
            JOIN ca_profiles cp ON cp.id = ccr.ca_id
            WHERE ccr.client_id = client_profiles.id
            AND cp.user_id = auth.uid()
            AND ccr.status = 'accepted'
        )
    );

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON public.client_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Clients can insert their own profile
CREATE POLICY "Clients can insert own profile" ON public.client_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================
-- SERVICE TYPES POLICIES
-- ========================

-- Anyone can view service types
CREATE POLICY "Public can view service types" ON public.service_types
    FOR SELECT USING (is_active = true);

-- ========================
-- CA SERVICES POLICIES
-- ========================

-- Anyone can view active CA services
CREATE POLICY "Public can view CA services" ON public.ca_services
    FOR SELECT USING (is_active = true);

-- CAs can manage their own services
CREATE POLICY "CAs can manage own services" ON public.ca_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ca_profiles WHERE id = ca_services.ca_id AND user_id = auth.uid()
        )
    );

-- ========================
-- CA SPECIALIZATIONS POLICIES
-- ========================

-- Anyone can view CA specializations
CREATE POLICY "Public can view CA specializations" ON public.ca_specializations
    FOR SELECT USING (true);

-- CAs can manage their own specializations
CREATE POLICY "CAs can manage own specializations" ON public.ca_specializations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ca_profiles WHERE id = ca_specializations.ca_id AND user_id = auth.uid()
        )
    );

-- ========================
-- RELATIONSHIPS POLICIES
-- ========================

-- Users can view their own relationships
CREATE POLICY "Users can view own relationships" ON public.ca_client_relationships
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = ca_client_relationships.ca_id AND user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM client_profiles WHERE id = ca_client_relationships.client_id AND user_id = auth.uid())
    );

-- Users can create relationship requests
CREATE POLICY "Users can create relationship requests" ON public.ca_client_relationships
    FOR INSERT WITH CHECK (requested_by = auth.uid());

-- Users can update relationships they're part of
CREATE POLICY "Users can update own relationships" ON public.ca_client_relationships
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = ca_client_relationships.ca_id AND user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM client_profiles WHERE id = ca_client_relationships.client_id AND user_id = auth.uid())
    );

-- ========================
-- CASES POLICIES
-- ========================

-- CAs can view cases assigned to them
CREATE POLICY "CAs can view assigned cases" ON public.cases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = cases.ca_id AND user_id = auth.uid())
    );

-- Clients can view their own cases
CREATE POLICY "Clients can view own cases" ON public.cases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM client_profiles WHERE id = cases.client_id AND user_id = auth.uid())
    );

-- CAs can create cases
CREATE POLICY "CAs can create cases" ON public.cases
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = cases.ca_id AND user_id = auth.uid())
    );

-- CAs can update cases assigned to them
CREATE POLICY "CAs can update assigned cases" ON public.cases
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = cases.ca_id AND user_id = auth.uid())
    );

-- ========================
-- DOCUMENTS POLICIES
-- ========================

-- Users can view documents they uploaded or are shared with them
CREATE POLICY "Users can view accessible documents" ON public.case_documents
    FOR SELECT USING (
        uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM cases c
            JOIN ca_profiles cp ON cp.id = c.ca_id
            WHERE c.id = case_documents.case_id AND cp.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM cases c
            JOIN client_profiles clp ON clp.id = c.client_id
            WHERE c.id = case_documents.case_id AND clp.user_id = auth.uid()
        )
    );

-- Users can upload documents
CREATE POLICY "Users can upload documents" ON public.case_documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- ========================
-- NOTIFICATIONS POLICIES
-- ========================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ========================
-- MESSAGES POLICIES
-- ========================

-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND auth.uid() = ANY(c.participant_ids)
        )
    );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND auth.uid() = ANY(c.participant_ids)
        )
    );

-- ========================
-- REVIEWS POLICIES
-- ========================

-- Anyone can view published reviews
CREATE POLICY "Public can view published reviews" ON public.ca_reviews
    FOR SELECT USING (is_published = true);

-- Clients can create reviews for completed cases
CREATE POLICY "Clients can create reviews" ON public.ca_reviews
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM client_profiles WHERE id = ca_reviews.client_id AND user_id = auth.uid())
    );

-- CAs can respond to reviews
CREATE POLICY "CAs can respond to reviews" ON public.ca_reviews
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = ca_reviews.ca_id AND user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM ca_profiles WHERE id = ca_reviews.ca_id AND user_id = auth.uid())
    );

-- ================================================================
-- SECTION 16: FUNCTIONS & TRIGGERS
-- ================================================================

-- ========================
-- 16.1 HANDLE NEW USER SIGNUP
-- ========================
-- This function is called automatically when a new user signs up via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    first_name TEXT;
    last_name TEXT;
BEGIN
    -- Extract role and name from metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
    last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    
    -- Insert into users table
    INSERT INTO public.users (id, email, role, status, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        user_role,
        CASE 
            WHEN user_role = 'ca' THEN 'pending_onboarding'
            WHEN user_role = 'firm' THEN 'pending_verification'
            ELSE 'active'
        END,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create role-specific profile
    IF user_role = 'ca' THEN
        INSERT INTO public.ca_profiles (user_id, first_name, last_name, display_name)
        VALUES (
            NEW.id,
            first_name,
            last_name,
            CONCAT(first_name, ' ', last_name)
        );
    ELSIF user_role = 'client' THEN
        INSERT INTO public.client_profiles (user_id, first_name, last_name)
        VALUES (
            NEW.id,
            first_name,
            last_name
        );
    ELSIF user_role = 'firm' THEN
        INSERT INTO public.firm_profiles (user_id, firm_name)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'firm_name', CONCAT(first_name, ' ', last_name, ' & Associates'))
        );
    END IF;
    
    -- Create welcome notification
    INSERT INTO public.notifications (user_id, title, message, type, category)
    VALUES (
        NEW.id,
        'Welcome to TaxMate!',
        'Your account has been created successfully. ' ||
        CASE 
            WHEN user_role = 'ca' THEN 'Please complete your profile and verification to start accepting clients.'
            WHEN user_role = 'firm' THEN 'Please complete your firm registration and verification.'
            ELSE 'Start exploring to find the perfect CA for your needs.'
        END,
        'success',
        'account'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- 16.2 UPDATE TIMESTAMPS
-- ========================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'ca_profiles', 'client_profiles', 'firm_profiles',
        'ca_services', 'ca_client_relationships', 'cases', 'case_documents',
        'appointments', 'invoices', 'ca_reviews', 'conversations',
        'compliance_deadlines', 'support_tickets'
    ]
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON public.%s
                FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ========================
-- 16.3 GENERATE CASE NUMBER
-- ========================

CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        NULLIF(regexp_replace(case_number, '[^0-9]', '', 'g'), '')::INTEGER
    ), 0) + 1
    INTO sequence_num
    FROM public.cases
    WHERE case_number LIKE 'TM-' || year_prefix || '-%';
    
    NEW.case_number := 'TM-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_case_number_trigger ON public.cases;
CREATE TRIGGER generate_case_number_trigger
    BEFORE INSERT ON public.cases
    FOR EACH ROW
    WHEN (NEW.case_number IS NULL)
    EXECUTE FUNCTION public.generate_case_number();

-- ========================
-- 16.4 GENERATE INVOICE NUMBER
-- ========================

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(
        NULLIF(regexp_replace(invoice_number, '[^0-9]', '', 'g'), '')::INTEGER
    ), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || year_prefix || '-%';
    
    NEW.invoice_number := 'INV-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON public.invoices;
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION public.generate_invoice_number();

-- ========================
-- 16.5 UPDATE CA STATS
-- ========================

CREATE OR REPLACE FUNCTION public.update_ca_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update review stats
    IF TG_TABLE_NAME = 'ca_reviews' THEN
        UPDATE public.ca_profiles
        SET 
            average_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM public.ca_reviews
                WHERE ca_id = COALESCE(NEW.ca_id, OLD.ca_id)
                AND is_published = true
            ),
            total_reviews = (
                SELECT COUNT(*)
                FROM public.ca_reviews
                WHERE ca_id = COALESCE(NEW.ca_id, OLD.ca_id)
                AND is_published = true
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.ca_id, OLD.ca_id);
    END IF;
    
    -- Update client count
    IF TG_TABLE_NAME = 'ca_client_relationships' THEN
        UPDATE public.ca_profiles
        SET 
            total_clients = (
                SELECT COUNT(*)
                FROM public.ca_client_relationships
                WHERE ca_id = COALESCE(NEW.ca_id, OLD.ca_id)
                AND status = 'accepted'
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.ca_id, OLD.ca_id);
    END IF;
    
    -- Update completed cases count
    IF TG_TABLE_NAME = 'cases' THEN
        UPDATE public.ca_profiles
        SET 
            completed_cases = (
                SELECT COUNT(*)
                FROM public.cases
                WHERE ca_id = COALESCE(NEW.ca_id, OLD.ca_id)
                AND status = 'completed'
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.ca_id, OLD.ca_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for CA stats
DROP TRIGGER IF EXISTS update_ca_review_stats ON public.ca_reviews;
CREATE TRIGGER update_ca_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.ca_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_ca_stats();

DROP TRIGGER IF EXISTS update_ca_client_stats ON public.ca_client_relationships;
CREATE TRIGGER update_ca_client_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.ca_client_relationships
    FOR EACH ROW EXECUTE FUNCTION public.update_ca_stats();

DROP TRIGGER IF EXISTS update_ca_case_stats ON public.cases;
CREATE TRIGGER update_ca_case_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.update_ca_stats();

-- ========================
-- 16.6 UPDATE CONVERSATION ON NEW MESSAGE
-- ========================

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    -- Update unread count for other participants
    UPDATE public.conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message_trigger ON public.messages;
CREATE TRIGGER update_conversation_on_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ================================================================
-- SECTION 17: SEED DATA - SERVICE TYPES
-- ================================================================

INSERT INTO public.service_types (code, name, description, category, is_active) VALUES
    ('ITR_SALARIED', 'ITR Filing - Salaried', 'Income Tax Return filing for salaried individuals', 'Tax', true),
    ('ITR_BUSINESS', 'ITR Filing - Business', 'Income Tax Return filing for business owners', 'Tax', true),
    ('ITR_CAPITAL_GAINS', 'ITR Filing - Capital Gains', 'ITR with capital gains from stocks, property, etc.', 'Tax', true),
    ('ITR_NRI', 'ITR Filing - NRI', 'Income Tax Return for Non-Resident Indians', 'Tax', true),
    ('GST_REGISTRATION', 'GST Registration', 'New GST registration for businesses', 'GST', true),
    ('GST_RETURN_MONTHLY', 'GST Return - Monthly', 'Monthly GST return filing (GSTR-1, GSTR-3B)', 'GST', true),
    ('GST_RETURN_ANNUAL', 'GST Annual Return', 'Annual GST return filing (GSTR-9)', 'GST', true),
    ('GST_AUDIT', 'GST Audit', 'GST Audit and reconciliation', 'GST', true),
    ('TDS_RETURN', 'TDS Return Filing', 'TDS return preparation and filing', 'Compliance', true),
    ('COMPANY_REGISTRATION', 'Company Registration', 'Private Limited / LLP registration', 'Registration', true),
    ('ROC_COMPLIANCE', 'ROC Compliance', 'Annual ROC filing and compliance', 'Compliance', true),
    ('TRADEMARK', 'Trademark Registration', 'Trademark search and registration', 'Registration', true),
    ('BOOKKEEPING', 'Bookkeeping', 'Monthly bookkeeping and accounting', 'Accounting', true),
    ('PAYROLL', 'Payroll Processing', 'Monthly payroll processing', 'Accounting', true),
    ('AUDIT', 'Statutory Audit', 'Statutory audit for companies', 'Audit', true),
    ('TAX_PLANNING', 'Tax Planning', 'Tax planning and advisory', 'Advisory', true),
    ('CONSULTATION', 'General Consultation', 'General financial consultation', 'Advisory', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- SECTION 18: INDEXES FOR PERFORMANCE
-- ================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- CA Profiles
CREATE INDEX IF NOT EXISTS idx_ca_profiles_user_id ON public.ca_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_verification_status ON public.ca_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_slug ON public.ca_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_ca_profiles_is_available ON public.ca_profiles(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_ca_profiles_rating ON public.ca_profiles(average_rating DESC);

-- Client Profiles
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_ca_id ON public.cases(ca_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON public.cases(deadline);

-- Documents
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_client_id ON public.case_documents(client_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_ca_id ON public.appointments(ca_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);

-- ================================================================
-- SECTION 19: STORAGE BUCKETS
-- ================================================================
-- Note: Run these in Supabase Dashboard > Storage or via API

-- Create buckets (if using SQL - requires superuser)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--     ('avatars', 'avatars', true),
--     ('documents', 'documents', false),
--     ('verification-documents', 'verification-documents', false),
--     ('case-files', 'case-files', false);

-- ================================================================
-- COMPLETE! Your TaxMate database is ready.
-- ================================================================

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TaxMate Database Schema Created Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: users, ca_profiles, client_profiles, firm_profiles,';
    RAISE NOTICE '                ca_services, ca_specializations, ca_client_relationships,';
    RAISE NOTICE '                cases, case_activities, case_documents, appointments,';
    RAISE NOTICE '                ca_availability, invoices, invoice_items, payments,';
    RAISE NOTICE '                ca_reviews, conversations, messages, notifications,';
    RAISE NOTICE '                compliance_deadlines, support_tickets, activity_logs';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'RLS Policies: Enabled on all tables';
    RAISE NOTICE 'Triggers: User signup, timestamps, stats updates';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create storage buckets in Supabase Dashboard';
    RAISE NOTICE '2. Configure email templates for auth';
    RAISE NOTICE '3. Set up your .env.local with Supabase credentials';
    RAISE NOTICE '========================================';
END;
$$;
