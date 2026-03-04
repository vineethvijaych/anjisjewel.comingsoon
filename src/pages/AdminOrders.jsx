import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "vineethcpz6881@gmail.com"; // ← replace with your email

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const { user }              = useCart();
  const navigate              = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    const parsed = (data || []).map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
    }));
    setOrders(parsed);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const statusColor = {
    paid:      { bg: "rgba(33,96,60,0.25)",   color: "#5ecb8c", border: "rgba(94,203,140,0.2)"  },
    shipped:   { bg: "rgba(200,168,75,0.15)",  color: "#c8a84b", border: "rgba(200,168,75,0.3)"  },
    delivered: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", border: "rgba(96,165,250,0.3)"  },
    cancelled: { bg: "rgba(185,64,64,0.15)",   color: "#e08080", border: "rgba(185,64,64,0.3)"   },
  };

  if (loading) return (
    <div className="orders-page">
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <p className="section-label">Admin Panel</p>
        <h1 className="section-title">All <em>Orders</em></h1>
        <p style={{ fontSize: 13, color: "var(--stone)", marginTop: 8 }}>
          {orders.length} orders &nbsp;·&nbsp;
          ₹ {orders.reduce((s, o) => s + Number(o.total), 0).toLocaleString("en-IN")} total revenue
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {["all", "paid", "shipped", "delivered", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 20px", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
            fontFamily: "var(--font-body)",
            background: filter === f ? "var(--gold)" : "var(--deep)",
            color: filter === f ? "var(--forest)" : "var(--stone)",
            border: `1px solid ${filter === f ? "var(--gold)" : "rgba(200,168,75,0.1)"}`,
            transition: "all 0.3s",
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => {
            const sc = statusColor[order.status] || statusColor.paid;
            return (
              <div key={order.id} style={{
                background: "var(--deep)", marginBottom: 2,
                border: "1px solid rgba(200,168,75,0.08)", padding: "28px 32px"
              }}>

                {/* Top row — order ID + amount */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 4 }}>Order ID</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--cream)" }}>{order.order_id}</p>
                    <p style={{ fontSize: 11, color: "var(--flint)", marginTop: 4 }}>
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                      &nbsp;·&nbsp; {order.payment_method}
                      {order.razorpay_payment_id && (
                        <span style={{ color: "var(--stone)" }}> · {order.razorpay_payment_id}</span>
                      )}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--gold)" }}>
                      ₹ {Number(order.total).toLocaleString("en-IN")}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--stone)" }}>
                      incl. GST ₹ {Number(order.gst).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 10 }}>Items Ordered</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        background: "var(--royal)", padding: "10px 16px",
                        fontSize: 13, color: "var(--linen)"
                      }}>
                        <span><strong style={{ color: "var(--cream)" }}>{item.name}</strong> × {item.quantity}</span>
                        <span style={{ color: "var(--gold)" }}>
                          ₹ {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address */}
                {order.shipping_address && (
                  <div style={{
                    marginBottom: 20, padding: "14px 18px",
                    background: "var(--royal)", borderLeft: "2px solid var(--gold)"
                  }}>
                    <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 8 }}>Ship To</p>
                    <p style={{ fontSize: 13, color: "var(--cream)", marginBottom: 4 }}>
                      <strong>{order.shipping_name}</strong> · {order.shipping_phone}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--linen)" }}>{order.shipping_address}</p>
                  </div>
                )}

                {/* Status controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--stone)" }}>Status:</span>
                  <span style={{
                    padding: "4px 14px", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                  }}>{order.status}</span>
                  <span style={{ fontSize: 11, color: "var(--flint)" }}>Update →</span>
                  {["paid", "shipped", "delivered", "cancelled"]
                    .filter(s => s !== order.status)
                    .map(s => (
                      <button key={s} onClick={() => updateStatus(order.id, s)} style={{
                        padding: "6px 14px", fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
                        fontFamily: "var(--font-body)", background: "transparent",
                        color: "var(--stone)", border: "1px solid rgba(200,168,75,0.15)",
                        transition: "all 0.3s"
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(200,168,75,0.15)"; e.currentTarget.style.color = "var(--stone)"; }}
                      >{s}</button>
                    ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}