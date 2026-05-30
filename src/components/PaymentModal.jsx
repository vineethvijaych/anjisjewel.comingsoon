import { useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = "rzp_live_SsoA1qfhFriQAG";
const SUPABASE_URL =
  "https://dykwmbvftulelqfnvvgt.supabase.co";

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    if (
      document.getElementById(
        "razorpay-script"
      )
    ) {
      const check = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);

      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.id =
      "razorpay-script";

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(
      script
    );
  });
}

async function callEdge(
  fn,
  body
) {
  const url = `${SUPABASE_URL}/functions/v1/${fn}`;

  const res = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify(body),
  });

  const text =
    await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `${fn} returned invalid response`
    );
  }

  if (!res.ok)
    throw new Error(
      data?.error ||
        `${fn} failed`
    );

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
  const [loading, setLoading] =
    useState(false);

  const [err, setErr] =
    useState("");

  const [step, setStep] =
    useState("");
    const [processingOrder, setProcessingOrder] =
  useState(false);

  const {
    user,
    fetchCartCount,
    addToast,
  } = useCart();

  const navigate =
    useNavigate();

  const saveOrder =
    async ({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
    }) => {
      const { error } =
        await supabase
          .from("orders")
          .insert({
            user_id: user.id,

            order_id: orderId,

            razorpay_order_id:
              razorpayOrderId,

            razorpay_payment_id:
              razorpayPaymentId,

            items:
              JSON.stringify(
                cart.map(
                  item => ({
                    product_id:
                      item.product_id,

                    name:
                      item.products
                        ?.name,

                    price:
                      Number(
                        item
                          .products
                          ?.price
                      ),

                    quantity:
                      item.quantity,
                  })
                )
              ),

            subtotal:
  Number(subtotal),

delivery_charge:
  Number(deliveryCharge),

total:
  Number(total),

            payment_method:
              "razorpay",

            status: "paid",

            shipping_name:
              shippingInfo?.full_name ||
              "",

            shipping_phone:
              shippingInfo?.phone ||
              "",

            shipping_address:
              shippingInfo
                ? `${shippingInfo.line1}${
                    shippingInfo.line2
                      ? ", " +
                        shippingInfo.line2
                      : ""
                  }, ${
                    shippingInfo.city
                  }, ${
                    shippingInfo.state
                  } — ${
                    shippingInfo.pincode
                  }`
                : "",
          });

      if (error)
        throw new Error(
          error.message
        );

      for (const item of cart) {
        const { data: prod } =
          await supabase
            .from(
              "products"
            )
            .select(
              "stock"
            )
            .eq(
              "id",
              item.product_id
            )
            .single();

        if (prod) {
          await supabase
            .from(
              "products"
            )
            .update({
              stock:
                Math.max(
                  0,
                  prod.stock -
                    item.quantity
                ),
            })
            .eq(
              "id",
              item.product_id
            );
        }
      }

      await supabase
        .from("cart")
        .delete()
        .eq(
          "user_id",
          user.id
        );

      await fetchCartCount();
    };

  const handlePayment =
    async () => {
      setErr("");
      setLoading(true);

      try {
        setStep(
          "Loading payment gateway..."
        );

        const loaded =
          await loadRazorpayScript();

        if (!loaded)
          throw new Error(
            "Razorpay failed to load"
          );

        setStep(
          "Creating order..."
        );

        const orderId = `AJ-${Date.now()
          .toString(36)
          .toUpperCase()}`;

        const {
          order_id:
            razorpayOrderId,
          amount,
        } = await callEdge(
          "razorpay-create-order",
          {
            amount: total,
            receipt:
              orderId,
          }
        );

        setLoading(false);

        await new Promise(
          (
            resolve,
            reject
          ) => {
            const rzp =
              new window.Razorpay(
                {
                  key:
                    RAZORPAY_KEY_ID,

                  amount,

                  currency:
                    "INR",

                  order_id:
                    razorpayOrderId,

                  name:
                    "AnjisJewel",

                  description:
                    "Luxury Jewellery Purchase",

                  prefill:
                    {
                      name:
                        shippingInfo?.full_name ||
                        "",

                      email:
                        user.email,

                      contact:
                        shippingInfo?.phone ||
                        "",
                    },

                  theme:
                    {
                      color:
                        "#0d2818",
                    },

                  modal:
                    {
                      ondismiss:
                        () =>
                          reject(
                            new Error(
                              "cancelled"
                            )
                          ),
                    },

                  handler:
                    async response => {
                      setLoading(
                        true
                      );

                      try {
                        setStep(
                          "Verifying payment..."
                        );

                        const {
                          verified,
                        } =
                          await callEdge(
                            "razorpay-verify-payment",
                            {
                              razorpay_order_id:
                                response.razorpay_order_id,

                              razorpay_payment_id:
                                response.razorpay_payment_id,

                              razorpay_signature:
                                response.razorpay_signature,
                            }
                          );

                        if (
                          !verified
                        )
                          throw new Error(
                            "Verification failed"
                          );

                        setStep(
  "Confirming order..."
);

setProcessingOrder(true);

await saveOrder({
                            orderId,

                            razorpayOrderId:
                              response.razorpay_order_id,

                            razorpayPaymentId:
                              response.razorpay_payment_id,
                          }
                        );

                        addToast(
                          "Payment successful!",
                          "success"
                        );

                        navigate(
                          "/success",
                          {
                            state:
                              {
                                orderId,
                                total,
                              },
                          }
                        );

                        resolve();
                      } catch (
                        e
                      ) {
                        reject(
                          e
                        );
                      }
                    },
                }
              );

            rzp.open();
          }
        );
      } catch (e) {
        if (
          e.message !==
          "cancelled"
        ) {
          setErr(
            e.message
          );
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
        background: "#fff",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          border:
            "4px solid #eee",
          borderTop:
            "4px solid #0d2818",
          borderRadius: "50%",
          animation:
            "spin 1s linear infinite",
        }}
      />

      <h2
        style={{
          marginTop: 25,
          color: "#0d2818",
        }}
      >
        Payment Successful
      </h2>

      <p
        style={{
          color: "#666",
          marginTop: 10,
          maxWidth: "280px",
          lineHeight: 1.5,
        }}
      >
        Please wait while we
        confirm your order and
        generate your order ID.
      </p>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
  return (
    <div
      className="modal-backdrop"
      onClick={e =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div className="payment-modal">
        <div className="modal-header">
          <h2>
            Secure Payment
          </h2>

          <button
            className="modal-close"
            onClick={
              onClose
            }
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-section-label">
            Order Summary
          </p>

          <div className="modal-order-items">
            {cart.map(
              item => (
                <div
                  key={
                    item.id
                  }
                  className="modal-order-item"
                >
                  <span>
                    {
                      item
                        .products
                        ?.name
                    }{" "}
                    ×{" "}
                    {
                      item.quantity
                    }
                  </span>

                  <span>
                    ₹{" "}
                    {(
                      Number(
                        item
                          .products
                          ?.price
                      ) *
                      item.quantity
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              )
            )}
          </div>

        <>
  <div className="modal-order-total">
    <span>Subtotal</span>

    <span>
      ₹ {Number(subtotal).toLocaleString("en-IN")}
    </span>
  </div>

  <div className="modal-order-total">
    <span>Shipping</span>

    <span>
      {deliveryCharge === 0
        ? "FREE"
        : `₹ ${deliveryCharge}`}
    </span>
  </div>

  <div className="modal-order-total">
    <span>Total Payable</span>

    <span className="tot-amount">
      ₹ {Number(total).toLocaleString("en-IN")}
    </span>
  </div>
</>



            

          <button
            className="pay-btn"
            onClick={
              handlePayment
            }
            disabled={
              loading
            }
          >
            <span>
              {loading
                ? step ||
                  "Processing..."
                : `Pay ₹ ${Number(
                    total
                  ).toLocaleString(
                    "en-IN"
                  )} via Razorpay`}
            </span>
          </button>

          {err && (
            <div
              style={{
                marginTop: 15,
                color:
                  "red",
              }}
            >
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}