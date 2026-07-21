import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { caId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('ca_id', caId)
      .eq('status', 'published');

    if (error) throw error;

    const totalReviews = reviews?.length || 0;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / totalReviews).toFixed(2)
      : 0;

    await supabase
      .from('ca_profiles')
      .update({
        rating_avg: parseFloat(String(avgRating)),
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', caId);

    return new Response(
      JSON.stringify({ caId, avgRating, totalReviews }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
