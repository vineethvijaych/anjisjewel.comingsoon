import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const KEY_ID     = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    console.log("KEY_ID:", KEY_ID.slice(0, 12));
    console.log("KEY_SECRET length:", KEY_SECRET.length);

    if (!KEY_ID || !KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Missing credentials" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const { amount, receipt, currency = "INR" } = await req.json();
    const amountPaise = Math.round(Number(amount) * 100);

    if (amountPaise < 100) {
      return new Response(
        JSON.stringify({ error: "Amount must be at least ₹1" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const credentials = base64Encode(`${KEY_ID}:${KEY_SECRET}`);

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({ amount: amountPaise, currency, receipt }),
    });

    const data = await res.json();
    console.log("Razorpay status:", res.status, JSON.stringify(data));

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.description || "Order creation failed", detail: data }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ order_id: data.id, amount: data.amount, currency: data.currency }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});