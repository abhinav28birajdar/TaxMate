-- Secure CA ratings and expose only non-sensitive CA profile fields publicly.

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_client_ca
  ON public.reviews (ca_id, client_id);

CREATE OR REPLACE FUNCTION public.submit_ca_rating(
  p_ca_id UUID,
  p_rating INTEGER,
  p_title TEXT DEFAULT NULL,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reviewer UUID := auth.uid();
  result JSONB;
BEGIN
  IF reviewer IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = p_ca_id AND role IN ('CA', 'STAFF') AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'CA not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.ca_client_relationships
    WHERE ca_id = p_ca_id AND client_id = reviewer AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only an active client may rate this CA' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.reviews (ca_id, client_id, rating, title, comment, is_verified)
  VALUES (p_ca_id, reviewer, p_rating, NULLIF(p_title, ''), NULLIF(p_comment, ''), TRUE)
  ON CONFLICT (ca_id, client_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    title = EXCLUDED.title,
    comment = EXCLUDED.comment,
    updated_at = NOW();

  UPDATE public.ca_profiles
  SET
    average_rating = COALESCE((SELECT AVG(rating)::DECIMAL(3, 2) FROM public.reviews WHERE ca_id = p_ca_id), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE ca_id = p_ca_id),
    updated_at = NOW()
  WHERE user_id = p_ca_id;

  SELECT jsonb_build_object(
    'caId', p_ca_id,
    'rating', p_rating,
    'averageRating', cp.average_rating,
    'reviewCount', cp.review_count
  )
  INTO result
  FROM public.ca_profiles cp
  WHERE cp.user_id = p_ca_id;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_ca_rating(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_ca_rating(UUID, INTEGER, TEXT, TEXT) TO authenticated;

DROP POLICY IF EXISTS ca_profiles_public_select ON public.ca_profiles;
CREATE POLICY ca_profiles_private_select ON public.ca_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_user() OR auth.role() = 'service_role');

CREATE OR REPLACE VIEW public.public_ca_profiles AS
SELECT
  user_id,
  firm_name,
  designation,
  bio,
  years_of_experience,
  specializations,
  languages,
  status,
  city,
  state,
  country,
  website_url,
  linkedin_url,
  consultation_fee,
  accepts_online_payment,
  slug,
  total_clients,
  average_rating,
  review_count,
  signature_url,
  letterhead_url,
  created_at,
  updated_at
FROM public.ca_profiles
WHERE public_profile = TRUE AND status = 'APPROVED';

GRANT SELECT ON public.public_ca_profiles TO anon, authenticated;
