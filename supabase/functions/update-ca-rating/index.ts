import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('NEXT_PUBLIC_APP_URL') ?? '';
const corsHeaders = {
  'Access-Control-Allow-Origin': appUrl || 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Authentication required' }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) {
      return json({ error: 'Supabase function configuration is incomplete' }, 500);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Invalid or expired authentication token' }, 401);
    }

    const body = await req.json();
    if (
      typeof body?.caId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.caId) ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return json({ error: 'caId must be a UUID and rating must be an integer from 1 to 5' }, 400);
    }

    const { data, error } = await supabase.rpc('submit_ca_rating', {
      p_ca_id: body.caId,
      p_rating: body.rating,
      p_title: typeof body.title === 'string' ? body.title.trim().slice(0, 120) : null,
      p_comment: typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : null,
    });

    if (error) {
      const status = error.code === '42501' ? 403 : error.code === '23505' ? 409 : 400;
      return json({ error: error.message }, status);
    }

    return json({ success: true, rating: data });
  } catch (error) {
    console.error('update-ca-rating failed', error);
    return json({ error: 'Unable to update CA rating' }, 500);
  }
});
