import { useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = "rzp_live_SlbxVdKtuhuoO5";
const SUPABASE_URL    = "https://gbhedrawnqyqmlerisfd.supabase.co";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    if (document.getElementById("razorpay-script")) {
      const check = setInterval(() => {
        if (window.Razorpay) { clearInterval(check); resolve(true); }
      }, 100);
      return;
    }
    const script   = document.createElement("script");
    script.id      = "razorpay-script";
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function callEdge(fn, body) {
  const url = `${SUPABASE_URL}/functions/v1/${fn}`;
  console.log(`[Razorpay] Calling edge fn: ${url}`);

  const res  = await fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`[Razorpay] ${fn} response (${res.status}):`, text);

  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`${fn} returned invalid response: ${text}`); }

  if (!res.ok) throw new Error(data?.error || `${fn} failed with status ${res.status}`);
  return data;
}

export default function PaymentModal({ cart, subtotal, gst, total, shippingInfo, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [step, setStep]       = useState(""); // shows current step to user
  const { user, fetchCartCount, addToast } = useCart();
  const navigate = useNavigate();

  const saveOrder = async ({ orderId, razorpayOrderId, razorpayPaymentId }) => {
    const { error } = await supabase.from("orders").insert({
      user_id:             user.id,
      order_id:            orderId,
      razorpay_order_id:   razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      items: JSON.stringify(cart.map(item => ({
        product_id: item.product_id,
        name:       item.products?.name,
        price:      Number(item.products?.price),
        quantity:   item.quantity,
      }))),
      subtotal:         Number(subtotal),
      gst:              Number(gst),
      total:            Number(total),
      payment_method:   "razorpay",
      status:           "paid",
      shipping_name:    shippingInfo?.full_name || "",
      shipping_phone:   shippingInfo?.phone     || "",
      shipping_address: shippingInfo
        ? `${shippingInfo.line1}${shippingInfo.line2 ? ", " + shippingInfo.line2 : ""}, ${shippingInfo.city}, ${shippingInfo.state} — ${shippingInfo.pincode}`
        : "",
    });
    if (error) throw new Error("Order save failed: " + error.message);

    for (const item of cart) {
      const { data: prod } = await supabase
        .from("products").select("stock").eq("id", item.product_id).single();
      if (prod) {
        await supabase.from("products")
          .update({ stock: Math.max(0, prod.stock - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    await supabase.from("cart").delete().eq("user_id", user.id);
    await fetchCartCount();
  };

  const handlePayment = async () => {
    setErr("");
    setLoading(true);

    try {
      // Step 1 — Load script
      setStep("Loading payment gateway…");
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay script failed to load. Check your internet.");

      // Step 2 — Create order via Edge Function
      setStep("Creating order…");
      const orderId = `AJ-${Date.now().toString(36).toUpperCase()}`;
      const { order_id: razorpayOrderId, amount } = await callEdge("razorpay-create-order", {
        amount:  total,
        receipt: orderId,
      });

      console.log("[Razorpay] Order created:", razorpayOrderId, "amount:", amount);

      // Step 3 — Open Razorpay modal
      setStep("");
      setLoading(false); // allow button to show while modal is open

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         RAZORPAY_KEY_ID,
          amount,
          currency:    "INR",
          order_id:    razorpayOrderId,
          name:        "AnjisJewel",
          description: "Luxury Jewellery Purchase",
          prefill: {
            name:    shippingInfo?.full_name || "",
            email:   user.email,
            contact: shippingInfo?.phone    || "",
          },
          theme: { color: "#0d2818" },
          modal: { ondismiss: () => reject(new Error("cancelled")) },

          handler: async (response) => {
            setLoading(true);
            try {
              // Step 4 — Verify signature
              setStep("Verifying payment…");
              console.log("[Razorpay] Verifying:", response);

              const { verified } = await callEdge("razorpay-verify-payment", {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });

              if (!verified) throw new Error("Payment verification failed. Please contact support.");

              // Step 5 — Save to Supabase
              setStep("Confirming order…");
              await saveOrder({
                orderId,
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });

              addToast("Payment successful! Order confirmed ✦", "success");
              navigate("/success", { state: { orderId, total } });
              resolve();
            } catch (e) {
              console.error("[Razorpay] Handler error:", e);
              reject(e);
            }
          },
        });

        rzp.on("payment.failed", (r) => {
          console.error("[Razorpay] Payment failed:", r.error);
          reject(new Error(r.error?.description || "Payment failed. Please try another method."));
        });

        rzp.open();
      });

    } catch (e) {
      console.error("[Razorpay] Error:", e);
      if (e.message !== "cancelled") {
        setErr(e.message || "Something went wrong. Please try again.");
      }
      setLoading(false);
      setStep("");
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Secure Payment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-section-label">Order Summary</p>
          <div className="modal-order-items">
            {cart.map(item => (
              <div className="modal-order-item" key={item.id}>
                <span>{item.products?.name} × {item.quantity}</span>
                <span>₹ {(Number(item.products?.price) * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="modal-order-item" style={{ color:"var(--stone)" }}>
              <span>GST (3%)</span>
              <span>₹ {Number(gst).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="modal-order-total">
            <span>Total Payable</span>
            <span className="tot-amount">₹ {Number(total).toLocaleString("en-IN")}</span>
          </div>

          {shippingInfo && (
            <div style={{ background:"var(--warm-white)", border:"1px solid rgba(0,0,0,0.07)", padding:"14px 18px", marginBottom:24, borderLeft:"2px solid var(--gold)" }}>
              <p style={{ fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--stone)", marginBottom:8 }}>Delivering To</p>
              <p style={{ fontSize:13, color:"var(--text-dark)", marginBottom:4 }}>
                <strong>{shippingInfo.full_name}</strong> · {shippingInfo.phone}
              </p>
              <p style={{ fontSize:12, color:"var(--text-muted)" }}>
                {shippingInfo.line1}{shippingInfo.line2 ? `, ${shippingInfo.line2}` : ""}, {shippingInfo.city}, {shippingInfo.state} — {shippingInfo.pincode}
              </p>
            </div>
          )}

          <p className="modal-section-label">Accepted Payment Methods</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
            {["💳 Credit / Debit Card","📱 UPI (GPay, PhonePe)","🏦 Net Banking","👜 Wallets","📋 EMI"].map(m => (
              <div key={m} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--warm-white)", border:"1px solid rgba(0,0,0,0.08)", padding:"8px 14px", fontSize:12, color:"var(--text-muted)" }}>
                {m}
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(13,40,24,0.04)", border:"1px solid rgba(13,40,24,0.1)", padding:"14px 18px", marginBottom:24, fontSize:12, color:"var(--text-muted)", lineHeight:1.7 }}>
            <strong style={{ color:"var(--forest)", display:"block", marginBottom:4 }}>✦ Powered by Razorpay</strong>
            Your payment is processed securely by Razorpay's PCI-DSS certified servers.
          </div>

          {err && (
            <div style={{ background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.2)", padding:"12px 16px", marginBottom:16, fontSize:12, color:"#c0392b", lineHeight:1.6 }}>
              ⚠ &nbsp;{err}
              <br/>
              <span style={{ fontSize:10, opacity:0.7 }}>Check browser console (F12) for details.</span>
            </div>
          )}

          <button className="pay-btn" onClick={handlePayment} disabled={loading}>
            <span>
              {loading
                ? (step || "Processing…")
                : `Pay ₹ ${Number(total).toLocaleString("en-IN")} via Razorpay`}
            </span>
          </button>

          <div className="secure-note" style={{ marginTop:16 }}>
            <span>🔒</span>
            <span>256-bit SSL · PCI DSS Level 1 · RBI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}