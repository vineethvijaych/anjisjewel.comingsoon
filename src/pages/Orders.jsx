import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders]   = useState([]);
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
    card:       "💳 Card",
    upi:        "📱 UPI",
    netbanking: "🏦 Net Banking",
  };

  if (loading) return (
    <div className="orders-page">
      <div className="spinner-wrap" style={{ marginTop: 80 }}>
        <div className="spinner" />
        <p className="spinner-text">Loading your orders</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="orders-page">
      <div className="cart-empty">
        <div className="empty-icon">🔒</div>
        <h3>Sign in to view your orders</h3>
        <Link to="/login" className="btn-primary"><span>Sign In</span></Link>
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <p className="section-label">Purchase History</p>
        <h1 className="section-title">My <em>Orders</em></h1>
      </div>

      {orders.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here after your first purchase</p>
          <Link to="/" className="btn-primary"><span>Start Shopping</span></Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-card-top">
                <div>
                  <p className="order-id-label">Order ID</p>
                  <p className="order-id-val">{order.order_id}</p>
                </div>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>

              <div className="order-items-preview">
                {order.items.map((item, i) => (
                  <span key={i} className="order-item-chip">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>

              <div className="order-card-footer">
                <p className="order-date">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  &nbsp;·&nbsp;
                  {methodLabel[order.payment_method] || order.payment_method}
                </p>
                <p className="order-total-val">
                  ₹ {Number(order.total).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
