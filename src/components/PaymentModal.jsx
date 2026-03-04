import { useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = "rzp_test_SMfRyxMeSWVvZB";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id  = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ cart, subtotal, gst, total, shippingInfo, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const { user, fetchCartCount, addToast } = useCart();
  const navigate = useNavigate();

  const handleRazorpayPayment = async () => {
    setErr("");
    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      await new Promise((resolve, reject) => {
        const options = {
          key:         RAZORPAY_KEY_ID,
          amount:      Math.round(total * 100),
          currency:    "INR",
          name:        "AnjisJewel",
          description: "Luxury Jewellery Purchase",
          prefill:     { email: user.email },
          theme:       { color: "#c8a84b" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          handler: async (response) => {
            try {
              const orderId = `AJ-${Date.now().toString(36).toUpperCase()}`;

              const { error: orderErr } = await supabase.from("orders").insert({
                user_id:             user.id,
                order_id:            orderId,
                razorpay_order_id:   response.razorpay_order_id   || "",
                razorpay_payment_id: response.razorpay_payment_id || "",
                items: JSON.stringify(cart.map(item => ({
                  product_id: item.product_id,
                  name:       item.products?.name,
                  price:      Number(item.products?.price),
                  quantity:   item.quantity,
                }))),
                subtotal:        Number(subtotal),
                gst:             Number(gst),
                total:           Number(total),
                payment_method:  "razorpay",
                status:          "paid",
                shipping_name:    shippingInfo?.full_name    || "",
                shipping_phone:   shippingInfo?.phone        || "",
                shipping_address: shippingInfo
                  ? `${shippingInfo.line1}${shippingInfo.line2 ? ", " + shippingInfo.line2 : ""}, ${shippingInfo.city}, ${shippingInfo.state} — ${shippingInfo.pincode}`
                  : "",
              });

              if (orderErr) throw new Error(orderErr.message);

              // Decrement stock
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

              addToast("Payment successful! Order confirmed ✦", "success");
              navigate("/success", { state: { orderId, total } });
              resolve();
            } catch (e) { reject(e); }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", r => reject(new Error(r.error?.description || "Payment failed")));
        rzp.open();
      });

    } catch (e) {
      if (e.message !== "Payment cancelled") {
        setErr(e.message || "Payment failed. Please try again.");
      }
      setLoading(false);
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

          {/* Order Summary */}
          <p className="modal-section-label">Order Summary</p>
          <div className="modal-order-items">
            {cart.map(item => (
              <div className="modal-order-item" key={item.id}>
                <span>{item.products?.name} × {item.quantity}</span>
                <span>₹ {(Number(item.products?.price) * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="modal-order-item" style={{ color: "var(--stone)" }}>
              <span>GST (3%)</span>
              <span>₹ {Number(gst).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="modal-order-total">
            <span>Total Payable</span>
            <span className="tot-amount">₹ {Number(total).toLocaleString("en-IN")}</span>
          </div>

          {/* Shipping info preview */}
          {shippingInfo && (
            <div style={{
              background: "var(--royal)", border: "1px solid rgba(200,168,75,0.15)",
              padding: "14px 18px", marginBottom: 24, borderLeft: "2px solid var(--gold)"
            }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 8 }}>
                Delivering To
              </p>
              <p style={{ fontSize: 13, color: "var(--cream)", marginBottom: 4 }}>
                <strong>{shippingInfo.full_name}</strong> · {shippingInfo.phone}
              </p>
              <p style={{ fontSize: 12, color: "var(--linen)" }}>
                {shippingInfo.line1}{shippingInfo.line2 ? `, ${shippingInfo.line2}` : ""}, {shippingInfo.city}, {shippingInfo.state} — {shippingInfo.pincode}
              </p>
            </div>
          )}

          {/* Payment methods info */}
          <p className="modal-section-label">Accepted Payment Methods</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {[
              { icon: "💳", label: "Credit / Debit Card" },
              { icon: "📱", label: "UPI (GPay, PhonePe)" },
              { icon: "🏦", label: "Net Banking" },
              { icon: "👜", label: "Wallets" },
              { icon: "📋", label: "EMI" },
            ].map(m => (
              <div key={m.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--royal)", border: "1px solid rgba(200,168,75,0.12)",
                padding: "8px 14px", fontSize: 12, color: "var(--linen)",
              }}>
                <span>{m.icon}</span><span>{m.label}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)",
            padding: "14px 18px", marginBottom: 24, fontSize: 12, color: "var(--linen)", lineHeight: 1.7
          }}>
            <strong style={{ color: "var(--gold)", display: "block", marginBottom: 4 }}>✦ Powered by Razorpay</strong>
            Clicking "Pay Now" opens Razorpay's secure checkout. Your payment details
            are handled entirely by Razorpay's PCI-DSS certified servers.
          </div>

          {err && (
            <div style={{
              background: "rgba(185,64,64,0.08)", border: "1px solid rgba(185,64,64,0.25)",
              padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#e08080"
            }}>
              ⚠ &nbsp;{err}
            </div>
          )}

          <button className="pay-btn" onClick={handleRazorpayPayment} disabled={loading}>
            <span>{loading ? "Opening Razorpay…" : `Pay ₹ ${Number(total).toLocaleString("en-IN")} via Razorpay`}</span>
          </button>

          <div className="secure-note" style={{ marginTop: 16 }}>
            <span>🔒</span>
            <span>256-bit SSL · PCI DSS Level 1 · RBI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}