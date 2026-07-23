export {};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, title, body, data } = await req.json();

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: token, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    if (fcmServerKey) {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmServerKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body },
          data: data || {},
        }),
      });

      const resData = await response.json();
      return new Response(JSON.stringify({ success: true, resData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Push notification queued (simulated)', token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
