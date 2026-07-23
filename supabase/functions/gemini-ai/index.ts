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
    const { prompt, context } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ response: `[Simulated Gemini AI] Processing query: "${prompt}". Please configure GEMINI_API_KEY for live responses.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${context ? `Context: ${context}\n` : ''}${prompt}` }] }],
      }),
    });

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return new Response(
      JSON.stringify({ response: reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
