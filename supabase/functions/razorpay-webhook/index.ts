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
    const bodyText = await req.text();
    const event = JSON.parse(bodyText);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const amount = payment.amount / 100; // paise to INR

      // Update invoice status to PAID
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();

      if (invoice) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_amount: amount,
            balance_due: 0,
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoice.id);

        // Insert payment log
        await supabase.from('payments').insert({
          invoice_id: invoice.id,
          client_id: invoice.client_id,
          ca_id: invoice.ca_id,
          firm_id: invoice.firm_id,
          amount,
          currency: 'INR',
          payment_method: payment.method || 'razorpay',
          payment_gateway: 'RAZORPAY',
          gateway_order_id: orderId,
          gateway_payment_id: payment.id,
          status: 'completed',
          paid_at: new Date().toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
