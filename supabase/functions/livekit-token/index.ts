import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roomName, participantName } = await req.json();

    const apiKey = Deno.env.get('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET') || 'secretsecretsecretsecretsecretsecret';

    // Mock/JWT payload return for LiveKit client connection
    const token = `token_lk_${roomName}_${participantName}_${Date.now()}`;

    return new Response(
      JSON.stringify({ token, roomName, participantName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
