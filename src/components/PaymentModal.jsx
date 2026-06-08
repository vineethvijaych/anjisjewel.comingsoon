import { useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = "rzp_live_SsoA1qfhFriQAG";
const SUPABASE_URL = "https://dykwmbvftulelqfnvvgt.supabase.co";

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    if (document.getElementById("razorpay-script")) {
      const check = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function callEdge(fn, body) {
  const url = `${SUPABASE_URL}/functions/v1/${fn}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${fn} returned invalid response`);
  }
  if (!res.ok) throw new Error(data?.error || `${fn} failed`);
  return data;
}

export default function PaymentModal({
  cart,
  subtotal,
  total,
  deliveryCharge,
  shippingInfo,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [step, setStep] = useState("");
  const [processingOrder, setProcessingOrder] = useState(false);
  const { user, fetchCartCount, addToast } = useCart();
  const navigate = useNavigate();

  const saveOrder = async ({ orderId, razorpayOrderId, razorpayPaymentId }) => {
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      items: JSON.stringify(
        cart.map(item => ({
          product_id: item.product_id,
          name: item.products?.name,
          price: Number(item.products?.price),
          quantity: item.quantity,
        }))
      ),
      subtotal: Number(subtotal),
      delivery_charge: Number(deliveryCharge),
      total: Number(total),
      payment_method: "razorpay",
      status: "paid",
      shipping_name: shippingInfo?.full_name || "",
      shipping_phone: shippingInfo?.phone || "",
      shipping_address: shippingInfo
        ? `${shippingInfo.line1}${shippingInfo.line2 ? ", " + shippingInfo.line2 : ""}, ${shippingInfo.city}, ${shippingInfo.state} — ${shippingInfo.pincode}`
        : "",
    });

    if (error) throw new Error(error.message);

    for (const item of cart) {
      const { data: prod } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
      if (prod) {
        await supabase.from("products").update({ stock: Math.max(0, prod.stock - item.quantity) }).eq("id", item.product_id);
      }
    }

    await supabase.from("cart").delete().eq("user_id", user.id);
    await fetchCartCount();
  };

  const handlePayment = async () => {
    setErr("");
    setLoading(true);

    try {
      setStep("Loading payment gateway...");
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay failed to load");

      setStep("Creating order...");
      const orderId = `AJ-${Date.now().toString(36).toUpperCase()}`;
      const { order_id: razorpayOrderId, amount } = await callEdge("razorpay-create-order", {
        amount: total,
        receipt: orderId,
      });

      setLoading(false);

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY_ID,
          amount,
          currency: "INR",
          order_id: razorpayOrderId,
          name: "AnjisJewel",
          description: "Luxury Jewellery Purchase",
          prefill: {
            name: shippingInfo?.full_name || "",
            email: user.email,
            contact: shippingInfo?.phone || "",
          },
          theme: { color: "#c9a07c" }, // Gold theme
          modal: {
            ondismiss: () => reject(new Error("cancelled")),
          },
          handler: async response => {
            setLoading(true);
            try {
              setStep("Verifying payment...");
              const { verified } = await callEdge("razorpay-verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (!verified) throw new Error("Verification failed");
              setStep("Confirming order...");
              setProcessingOrder(true);
              await saveOrder({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });
              addToast("Payment successful!", "success");
              navigate("/success", { state: { orderId, total } });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
        rzp.open();
      });
    } catch (e) {
      if (e.message !== "cancelled") {
        setErr(e.message);
      }
      setLoading(false);
      setStep("");
    }
  };

  if (processingOrder) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#f4f1ec",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        {/* Gold decorative ring */}
        <div
          style={{
            position: "relative",
            width: "100px",
            height: "100px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(201, 160, 124, 0.2)",
              animation: "pulse 2s ease infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "10px",
              borderRadius: "50%",
              border: "2px solid rgba(201, 160, 124, 0.4)",
              animation: "pulse 2s ease infinite 0.3s",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "20px",
              borderRadius: "50%",
              border: "1px solid #c9a07c",
              borderTop: "2px solid #0d2818",
              animation: "spin 1.2s linear infinite",
            }}
          />
        </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 6vw, 36px)",
            fontWeight: "400",
            color: "#0d2818",
            marginBottom: "12px",
            letterSpacing: "-0.01em",
          }}
        >
          Payment Successful
        </h2>

        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "clamp(14px, 4vw, 16px)",
            color: "#666",
            maxWidth: "320px",
            lineHeight: 1.6,
          }}
        >
          Please wait while we confirm your order and generate your order ID.
        </p>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.05); opacity: 0.6; }
            100% { transform: scale(1); opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div
        className="payment-modal-backdrop"
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8, 18, 12, 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div
          className="payment-modal"
          style={{
            maxWidth: "560px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "0px",
            boxShadow: "0 40px 60px -20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(201, 160, 124, 0.2)",
            position: "relative",
            animation: "slideUp 0.4s ease",
          }}
        >
          {/* Decorative Gold Top Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #c9a07c, #d8b08b, #c9a07c)",
            }}
          />

          {/* Modal Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "28px 32px 20px",
              borderBottom: "1px solid rgba(201, 160, 124, 0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: "400",
                color: "#0d2818",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Secure Payment
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
                transition: "color 0.2s ease",
                padding: "4px 8px",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c9a07c")}
              onMouseLeave={e => (e.currentTarget.style.color = "#999")}
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div
            style={{
              padding: "24px 32px 32px",
            }}
          >
            {/* Section Label */}
            <p
              style={{
                fontFamily: "Jost, sans-serif",
                fontSize: "11px",
                fontWeight: "500",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a07c",
                marginBottom: "20px",
              }}
            >
              Order Summary
            </p>

            {/* Order Items */}
            <div
              style={{
                background: "#faf8f4",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid rgba(201, 160, 124, 0.1)",
              }}
            >
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                    fontFamily: "Jost, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#444" }}>
                    {item.products?.name} <span style={{ color: "#999", fontSize: "12px" }}>× {item.quantity}</span>
                  </span>
                  <span style={{ color: "#0d2818", fontWeight: "500" }}>
                    ₹ {(Number(item.products?.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12px",
                  marginTop: "4px",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#666" }}>Subtotal</span>
                <span style={{ color: "#0d2818" }}>₹ {Number(subtotal).toLocaleString("en-IN")}</span>
              </div>

              {/* Shipping */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "8px",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#666" }}>Shipping</span>
                <span style={{ color: "#0d2818" }}>{deliveryCharge === 0 ? "FREE" : `₹ ${deliveryCharge}`}</span>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.3), transparent)",
                  margin: "16px 0 12px",
                }}
              />

              {/* Total Payable */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                <span style={{ color: "#0d2818" }}>Total Payable</span>
                <span style={{ color: "#c9a07c", fontWeight: "600" }}>
                  ₹ {Number(total).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: loading ? "#f0ede8" : "#0d2818",
                color: loading ? "#999" : "#ffffff",
                border: loading ? "1px solid #e0ddd8" : "1px solid rgba(255,255,255,0.1)",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Jost, sans-serif",
                fontSize: "13px",
                fontWeight: "500",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                marginBottom: "16px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = "#c9a07c";
                  e.currentTarget.style.color = "#0d2818";
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.background = "#0d2818";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTop: "2px solid #c9a07c",
                      borderRadius: "50%",
                      
                    }}
                  />
                  {step || "Processing..."}
                </span>
              ) : (
                `Pay ₹ ${Number(total).toLocaleString("en-IN")} via Razorpay`
              )}
            </button>

            {/* Security Badges */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: "#aaa",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>🔒</span> SSL SECURE
              </span>
              <span
                style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: "#aaa",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>💳</span> RAZORPAY
              </span>
            </div>

            {/* Error Message */}
            {err && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(220, 53, 69, 0.08)",
                  color: "#dc3545",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid rgba(220, 53, 69, 0.2)",
                }}
              >
                {err}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buttonSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Hide scrollbar but keep functionality */
        .payment-modal::-webkit-scrollbar {
          width: 4px;
        }
        .payment-modal::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .payment-modal::-webkit-scrollbar-thumb {
          background: #c9a07c;
        }
      `}</style>
    </>
  );
}