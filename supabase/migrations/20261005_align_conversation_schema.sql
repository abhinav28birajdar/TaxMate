-- Align conversations with the client chat model without removing existing data.

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS participant_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

ALTER TABLE public.conversations
  ALTER COLUMN ca_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

UPDATE public.conversations
SET participant_ids = ARRAY_REMOVE(ARRAY[ca_id, client_id], NULL)
WHERE cardinality(participant_ids) = 0;

CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids
  ON public.conversations USING GIN (participant_ids);

CREATE OR REPLACE FUNCTION public.sync_conversation_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ca_user UUID;
  client_user UUID;
BEGIN
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
  WHERE id = ANY(NEW.participant_ids) AND id <> ca_user
  ORDER BY array_position(NEW.participant_ids, id)
  LIMIT 1;

  NEW.ca_id := COALESCE(ca_user, NEW.ca_id, NEW.participant_ids[1]);
  NEW.client_id := COALESCE(client_user, NEW.client_id, NEW.participant_ids[2]);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_participants_trigger ON public.conversations;
CREATE TRIGGER sync_conversation_participants_trigger
  BEFORE INSERT OR UPDATE OF participant_ids ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_conversation_participants();

DROP POLICY IF EXISTS conversations_access ON public.conversations;
CREATE POLICY conversations_access ON public.conversations
  FOR ALL
  USING (
    auth.uid() = ANY(participant_ids)
    OR ca_id = auth.uid()
    OR client_id = auth.uid()
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid() = ANY(participant_ids)
    OR ca_id = auth.uid()
    OR client_id = auth.uid()
    OR auth.role() = 'service_role'
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'message_read_receipts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_receipts;
  END IF;
END;
$$;
