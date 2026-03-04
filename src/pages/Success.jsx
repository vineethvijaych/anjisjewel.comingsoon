import { Link, useLocation } from "react-router-dom";

export default function Success() {
  const { state } = useLocation();
  const orderId = state?.orderId || "AJ-XXXXXXX";
  const total = state?.total;

  return (
    <div className="success-page">
      <div className="success-inner">
        <div className="success-icon">✦</div>
        <h1>Order <em>Confirmed</em></h1>
        <div className="success-divider" />

        <div className="success-order-box">
          <p className="order-id">Order Reference</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--cream)", marginBottom: 12 }}>{orderId}</p>
          {total && (
            <>
              <p className="order-id">Amount Paid</p>
              <p className="order-amount">₹ {total.toLocaleString("en-IN")}</p>
            </>
          )}
        </div>

        <p>
          Your order has been received and is being prepared with<br />
          the utmost care. A confirmation has been sent to your email.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/orders" className="btn-primary"><span>View My Orders</span></Link>
          <Link to="/" className="btn-ghost">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
