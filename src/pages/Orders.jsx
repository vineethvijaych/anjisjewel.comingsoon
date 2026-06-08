import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCart();

  useEffect(() => {
    if (user) loadOrders();
    else setLoading(false);
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Orders fetch error:", error);

    // items is stored as JSON string — parse it back
    const parsed = (data || []).map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
    }));
    setOrders(parsed);
    setLoading(false);
  };

  const methodLabel = {
    card: "💳 Card",
    upi: "📱 UPI",
    netbanking: "🏦 Net Banking",
    razorpay: "💳 Razorpay",
  };

  if (loading) return (
    <div style={{
      minHeight: "60vh",
      background: "#f4f1ec",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "24px",
      padding: "20px",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "2px solid rgba(201, 160, 124, 0.2)",
        borderTop: "2px solid #c9a07c",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{
        fontFamily: "Jost, sans-serif",
        fontSize: "12px",
        letterSpacing: "0.2em",
        color: "#999",
      }}>Loading your orders</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (!user) return (
    <div style={{
      minHeight: "60vh",
      background: "#f4f1ec",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        background: "#ffffff",
        padding: "48px 32px",
        textAlign: "center",
        border: "1px solid rgba(201, 160, 124, 0.2)",
      }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "20px",
        }}>🔒</div>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(22px, 6vw, 26px)",
          fontWeight: "400",
          color: "#0d2818",
          marginBottom: "24px",
        }}>Sign in to view your orders</h3>
        <Link to="/login" style={{
          display: "inline-block",
          padding: "12px 28px",
          background: "#0d2818",
          color: "#ffffff",
          textDecoration: "none",
          fontFamily: "Jost, sans-serif",
          fontSize: "10px",
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

  return (
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
        }}>Purchase History</p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(36px, 8vw, 52px)",
          fontWeight: "400",
          color: "#0d2818",
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          My <em style={{ fontStyle: "italic", color: "#c9a07c" }}>Orders</em>
        </h1>
        <div style={{
          width: "60px",
          height: "1px",
          background: "#c9a07c",
          margin: "20px auto 0",
          opacity: 0.4,
        }} />
      </div>

      {orders.length === 0 ? (
        // Empty State
        <div style={{
          maxWidth: "450px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "52px 40px",
          textAlign: "center",
          border: "1px solid rgba(201, 160, 124, 0.2)",
        }}>
          <div style={{
            fontSize: "56px",
            marginBottom: "20px",
            color: "#c9a07c",
          }}>📦</div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(22px, 6vw, 26px)",
            fontWeight: "400",
            color: "#0d2818",
            marginBottom: "12px",
          }}>No orders yet</h3>
          <p style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "14px",
            color: "#777",
            marginBottom: "32px",
          }}>Your order history will appear here after your first purchase</p>
          <Link to="/" style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#0d2818",
            color: "#ffffff",
            textDecoration: "none",
            fontFamily: "Jost, sans-serif",
            fontSize: "10px",
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
            Start Shopping
          </Link>
        </div>
      ) : (
        // Orders List
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: "#ffffff",
                padding: "28px",
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
              }}
            >
              {/* Top Section - Order ID and Status */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(201, 160, 124, 0.15)",
              }}>
                <div>
                  <p style={{
                    fontFamily: "Jost, sans-serif",
                    fontSize: "10px",
                    fontWeight: "600",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#999",
                    marginBottom: "6px",
                  }}>Order ID</p>
                  <p style={{
                    fontFamily: "Jost, sans-serif",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0d2818",
                    margin: 0,
                  }}>{order.order_id}</p>
                </div>
                
                {/* Status Badge */}
                <span style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  background: order.status === "paid" ? "rgba(201, 160, 124, 0.12)" : "rgba(13, 40, 24, 0.08)",
                  color: order.status === "paid" ? "#c9a07c" : "#0d2818",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: `1px solid ${order.status === "paid" ? "rgba(201, 160, 124, 0.3)" : "rgba(13, 40, 24, 0.15)"}`,
                }}>
                  {order.status === "paid" ? "✓ PAID" : order.status}
                </span>
              </div>

              {/* Items Preview */}
              <div style={{
                marginBottom: "20px",
              }}>
                <p style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "12px",
                }}>Items Purchased</p>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}>
                  {order.items.map((item, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#faf8f4",
                        padding: "6px 12px",
                        fontFamily: "Jost, sans-serif",
                        fontSize: "12px",
                        color: "#0d2818",
                        border: "1px solid rgba(201, 160, 124, 0.15)",
                      }}
                    >
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Section - Date and Total */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(201, 160, 124, 0.15)",
              }}>
                <div>
                  <p style={{
                    fontFamily: "Jost, sans-serif",
                    fontSize: "11px",
                    color: "#888",
                    margin: 0,
                  }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {methodLabel[order.payment_method] || order.payment_method}
                  </p>
                </div>
                <div>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(20px, 4vw, 24px)",
                    fontWeight: "600",
                    color: "#c9a07c",
                    margin: 0,
                  }}>
                    ₹ {Number(order.total).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Decorative Gold Dot */}
              <div style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                width: "3px",
                height: "3px",
                background: "#c9a07c",
                borderRadius: "50%",
                opacity: 0.3,
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}