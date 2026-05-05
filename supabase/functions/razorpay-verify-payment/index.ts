import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing required fields" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const generated = await hmacSHA256(KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);

    if (generated !== razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: "Signature mismatch" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ verified: false, error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
