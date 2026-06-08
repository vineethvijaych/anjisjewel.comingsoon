import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import AddressModal from "../components/AddressModal";

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23143824'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='64' fill='%23c8a84b' opacity='0.4'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const { user, fetchCartCount, addToast } = useCart();

  useEffect(() => {
    if (user) loadCart();
    else setLoading(false);
  }, [user]);

  const loadCart = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("cart")
      .select("*, products(*)")
      .eq("user_id", user.id);

    if (error) console.error("Cart load error:", error);

    setCart(data || []);
    setLoading(false);
  };

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeItem(item);
      return;
    }

    if (newQty > (item.products?.stock || 0)) {
      addToast("Not enough stock available", "error");
      return;
    }

    await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", item.id);

    setCart(prev =>
      prev.map(c =>
        c.id === item.id
          ? { ...c, quantity: newQty }
          : c
      )
    );

    fetchCartCount();
  };

  const removeItem = async (item) => {
    await supabase
      .from("cart")
      .delete()
      .eq("id", item.id);

    setCart(prev =>
      prev.filter(c => c.id !== item.id)
    );

    fetchCartCount();

    addToast(
      `${item.products?.name} removed`,
      "success"
    );
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.products?.price || 0) *
      item.quantity,
    0
  );

  const getDeliveryCharge = state => {
    if (!state) return 100;

    const southIndia = [
      "Tamil Nadu",
      "Karnataka",
      "Andhra Pradesh",
      "Telangana",
      "Puducherry",
    ];

    if (state === "Kerala") {
      return 0;
    }

    if (
      southIndia.includes(state)
    ) {
      return 60;
    }

    return 100;
  };

  const total = subtotal + deliveryCharge;

  // Loading State
  if (loading)
    return (
      <div style={{
        minHeight: "60vh",
        background: "#f4f1ec",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "2px solid rgba(201, 160, 124, 0.2)",
          borderTop: "2px solid #c9a07c",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{
          fontFamily: "Jost, sans-serif",
          fontSize: "13px",
          letterSpacing: "0.2em",
          color: "#999",
        }}>Loading your cart</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  // No User State
  if (!user)
    return (
      <div style={{
        minHeight: "60vh",
        background: "#f4f1ec",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          maxWidth: "450px",
          width: "100%",
          background: "#ffffff",
          padding: "52px 40px",
          textAlign: "center",
          border: "1px solid rgba(201, 160, 124, 0.2)",
        }}>
          <div style={{
            fontSize: "56px",
            marginBottom: "24px",
          }}>🔒</div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(24px, 5vw, 28px)",
            fontWeight: "400",
            color: "#0d2818",
            marginBottom: "12px",
          }}>Sign in to view your cart</h3>
          <p style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "14px",
            color: "#777",
            marginBottom: "32px",
          }}>Your selections await you</p>
          <Link to="/login" style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "#0d2818",
            color: "#ffffff",
            textDecoration: "none",
            fontFamily: "Jost, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#c9a07c";
            e.currentTarget.style.color = "#0d2818";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#0d2818";
            e.currentTarget.style.color = "#ffffff";
          }}>
            Sign In
          </Link>
        </div>
      </div>
    );

  // Empty Cart State
  if (cart.length === 0)
    return (
      <div style={{
        minHeight: "60vh",
        background: "#f4f1ec",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          maxWidth: "450px",
          width: "100%",
          background: "#ffffff",
          padding: "52px 40px",
          textAlign: "center",
          border: "1px solid rgba(201, 160, 124, 0.2)",
        }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "24px",
            color: "#c9a07c",
          }}>✦</div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(24px, 5vw, 28px)",
            fontWeight: "400",
            color: "#0d2818",
            marginBottom: "12px",
          }}>Your cart is empty</h3>
          <p style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "14px",
            color: "#777",
            marginBottom: "32px",
          }}>Discover our exclusive collection and find your perfect piece</p>
          <Link to="/" style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "#0d2818",
            color: "#ffffff",
            textDecoration: "none",
            fontFamily: "Jost, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#c9a07c";
            e.currentTarget.style.color = "#0d2818";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#0d2818";
            e.currentTarget.style.color = "#ffffff";
          }}>
            Explore Collection
          </Link>
        </div>
      </div>
    );

  // Cart with Items
  return (
    <>
      <div style={{
        background: "#f4f1ec",
        minHeight: "100vh",
        padding: "60px 24px 80px",
      }}>
        {/* Page Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "56px",
        }}>
          <p style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "11px",
            fontWeight: "400",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a07c",
            marginBottom: "12px",
          }}>Your Selection</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 8vw, 52px)",
            fontWeight: "400",
            color: "#0d2818",
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Your <em style={{ fontStyle: "italic", color: "#c9a07c" }}>Cart</em>
          </h1>
          <div style={{
            width: "60px",
            height: "1px",
            background: "#c9a07c",
            margin: "20px auto 0",
            opacity: 0.4,
          }} />
        </div>

        {/* Cart Layout */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "40px",
        }} className="cart-layout">
          
          {/* Cart Items */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "20px",
                background: "#ffffff",
                padding: "20px",
                border: "1px solid rgba(201, 160, 124, 0.15)",
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.4)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.15)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                {/* Product Image */}
                <img
                  src={item.products?.image || FALLBACK_IMG}
                  alt={item.products?.name}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  onError={e => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                {/* Product Info */}
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(16px, 4vw, 18px)",
                    fontWeight: "500",
                    color: "#0d2818",
                    margin: "0 0 8px 0",
                  }}>{item.products?.name}</h3>
                  <p style={{
                    fontFamily: "Jost, sans-serif",
                    fontSize: "14px",
                    color: "#c9a07c",
                    fontWeight: "500",
                    margin: "0 0 16px 0",
                  }}>₹ {Number(item.products?.price).toLocaleString("en-IN")} each</p>

                  {/* Quantity Controls */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    <button
                      onClick={() => updateQty(item, -1)}
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "transparent",
                        border: "1px solid rgba(201, 160, 124, 0.3)",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#0d2818",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "#c9a07c";
                        e.currentTarget.style.background = "#c9a07c";
                        e.currentTarget.style.color = "#0d2818";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.3)";
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#0d2818";
                      }}>−</button>
                    <span style={{
                      fontFamily: "Jost, sans-serif",
                      fontSize: "14px",
                      color: "#0d2818",
                      minWidth: "30px",
                      textAlign: "center",
                    }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item, 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "transparent",
                        border: "1px solid rgba(201, 160, 124, 0.3)",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#0d2818",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "#c9a07c";
                        e.currentTarget.style.background = "#c9a07c";
                        e.currentTarget.style.color = "#0d2818";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.3)";
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#0d2818";
                      }}>+</button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#aaa",
                    transition: "all 0.2s ease",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#c9a07c";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "#aaa";
                    e.currentTarget.style.transform = "scale(1)";
                  }}>✕</button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{
            background: "#ffffff",
            padding: "32px 28px",
            border: "1px solid rgba(201, 160, 124, 0.2)",
            position: "sticky",
            top: "20px",
            height: "fit-content",
          }}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "24px",
              fontWeight: "500",
              color: "#0d2818",
              margin: "0 0 24px 0",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(201, 160, 124, 0.2)",
            }}>Order Summary</h3>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              fontFamily: "Jost, sans-serif",
              fontSize: "14px",
              color: "#666",
            }}>
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span style={{ color: "#0d2818", fontWeight: "500" }}>₹ {subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              fontFamily: "Jost, sans-serif",
              fontSize: "14px",
              color: "#666",
            }}>
              <span>Shipping</span>
              <span style={{ color: "#c9a07c", fontSize: "12px", letterSpacing: "0.05em" }}>Calculated at Checkout</span>
            </div>

            <div style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.3), transparent)",
              margin: "20px 0 20px",
            }} />

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
            }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "20px",
                fontWeight: "500",
                color: "#0d2818",
              }}>Total</span>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "24px",
                fontWeight: "600",
                color: "#c9a07c",
              }}>₹ {total.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={() => setShowAddress(true)}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: "#0d2818",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontFamily: "Jost, sans-serif",
                fontSize: "11px",
                fontWeight: "500",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                marginBottom: "20px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#c9a07c";
                e.currentTarget.style.color = "#0d2818";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#0d2818";
                e.currentTarget.style.color = "#ffffff";
              }}>
              Proceed to Checkout
            </button>

            <div style={{
              textAlign: "center",
              fontFamily: "Jost, sans-serif",
              fontSize: "10px",
              color: "#aaa",
              letterSpacing: "0.1em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}>
              <span>🔒</span> Secure Checkout via Razorpay
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          
          .cart-layout > div:first-child {
            order: 2;
          }
          
          .cart-layout > div:last-child {
            order: 1;
            position: relative !important;
            top: 0 !important;
          }
        }
        
        @media (max-width: 550px) {
          .cart-layout > div:first-child > div {
            grid-template-columns: 80px 1fr auto !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          
          .cart-layout > div:first-child > div img {
            height: 90px !important;
          }
        }
      `}</style>

      {showAddress && (
        <AddressModal
          onConfirm={addr => {
            const charge = getDeliveryCharge(addr.state);
            setDeliveryCharge(charge);
            setShippingInfo(addr);
            setShowAddress(false);
            setShowPayment(true);
          }}
          onClose={() => setShowAddress(false)}
        />
      )}

      {showPayment && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          total={total}
          deliveryCharge={deliveryCharge}
          shippingInfo={shippingInfo}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}