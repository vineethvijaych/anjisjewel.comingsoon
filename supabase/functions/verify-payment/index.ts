// supabase/functions/verify-payment/index.ts
// Verifies Razorpay payment signature to confirm payment is genuine
// This MUST run server-side — signature uses your secret key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 verification using Web Crypto API (available in Deno)
async function verifySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): Promise<boolean> {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computedHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return computedHex === razorpaySignature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Our app data
      user_id,
      items,
      subtotal,
      gst,
      total,
      payment_method,
    } = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // 1. Verify the payment signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature. Payment may be tampered." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Signature valid → save order to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role bypasses RLS
    );

    const orderId = `AJ-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id,
        order_id:        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        items:           JSON.stringify(items),
        subtotal,
        gst,
        total,
        payment_method,
        status:          "paid",
      })
      .select()
      .single();

    if (orderErr) throw new Error(orderErr.message);

    // 3. Decrement stock for each item
    for (const item of items) {
      const { data: prod } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (prod) {
        await supabase
          .from("products")
          .update({ stock: Math.max(0, prod.stock - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    // 4. Clear cart
    await supabase.from("cart").delete().eq("user_id", user_id);

    return new Response(
      JSON.stringify({ success: true, order_id: orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
