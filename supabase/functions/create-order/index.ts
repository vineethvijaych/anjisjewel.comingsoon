// supabase/functions/create-order/index.ts
// This Edge Function runs on Supabase's servers (Deno runtime)
// It creates a Razorpay order using your SECRET key safely server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", receipt } = await req.json();

    // RAZORPAY_KEY_SECRET is set in Supabase Dashboard → Edge Functions → Secrets
    const keyId     = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Call Razorpay API to create an order
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Basic auth: base64(key_id:key_secret)
        "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount:   amount * 100, // Razorpay uses paise (₹1 = 100 paise)
        currency,
        receipt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || "Razorpay order creation failed");
    }

    const order = await response.json();

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
