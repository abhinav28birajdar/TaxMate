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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value');

    if (error) throw error;

    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((item: { key: string; value: string }) => {
      settingsMap[item.key] = item.value;
    });

    const isMaintenance = settingsMap['maintenance_mode'] === 'true';
    const message = settingsMap['maintenance_message'] || 'System is currently undergoing maintenance.';

    return new Response(
      JSON.stringify({
        isMaintenance,
        message,
        bypassKey: settingsMap['maintenance_bypass_key'] || '',
        estimatedEnd: settingsMap['maintenance_estimated_end'] || null,
        appVersion: settingsMap['maintenance_app_version'] || '1.0.0',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ isMaintenance: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
