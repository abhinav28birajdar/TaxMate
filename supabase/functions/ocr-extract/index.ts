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
    const { documentUrl, documentType } = await req.json();

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: {
          panNumber: 'AAACT1234F',
          taxableAmount: 185000,
          tdsAmount: 18500,
          documentType: documentType || 'FORM_16',
          confidenceScore: 0.98,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
