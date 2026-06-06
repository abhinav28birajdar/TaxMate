-- ================================================================
-- TAXMATE - NEW FEATURES ENHANCEMENT
-- ================================================================

-- 1. TAX REFUND TRACKER
CREATE TABLE IF NOT EXISTS public.tax_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    
    assessment_year TEXT NOT NULL,
    acknowledgement_number TEXT,
    refund_amount DECIMAL(12,2),
    status TEXT DEFAULT 'filed' CHECK (status IN ('filed', 'processed', 'rectification', 'refund_issued', 'refund_credited', 'adjusted', 'delayed')),
    
    filing_date DATE,
    processing_date DATE,
    issued_date DATE,
    credited_date DATE,
    
    bank_account_last4 TEXT,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime for tax_refunds
ALTER TABLE public.tax_refunds ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_refunds;

-- Policies for tax_refunds
CREATE POLICY "Users can view their own refunds" ON public.tax_refunds
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.ca_profiles WHERE user_id = auth.uid() AND id IN (
            SELECT ca_id FROM public.cases WHERE id = tax_refunds.case_id
        )
    ));

-- 2. AI TAX CONSULTANT
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    context_type TEXT, -- generic, specific_case, document_analysis
    context_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime for AI chat
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;

-- 3. COLLABORATION & PRESENCE (Transient state often handled by Realtime Channels, but session logs can be stored)
CREATE TABLE IF NOT EXISTS public.user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL, -- 'case', 'chat', 'document'
    resource_id UUID NOT NULL,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tax_refunds_updated_at
    BEFORE UPDATE ON public.tax_refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
