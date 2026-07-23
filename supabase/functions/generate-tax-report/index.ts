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
    const { clientId, assessmentYear, reportType } = await req.json();

    return new Response(
      JSON.stringify({
        success: true,
        reportId: `rpt_${Date.now()}`,
        clientId,
        assessmentYear: assessmentYear || '2026-27',
        reportUrl: `https://storage.taxmate.in/reports/tax_computation_${assessmentYear}.pdf`,
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
