import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import AddressModal from "../components/AddressModal";

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23143824'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='64' fill='%23c8a84b' opacity='0.4'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;

export default function Cart() {
  const [cart, setCart]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
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
    if (newQty <= 0) { removeItem(item); return; }
    if (newQty > (item.products?.stock || 0)) {
      addToast("Not enough stock available", "error");
      return;
    }
    await supabase.from("cart").update({ quantity: newQty }).eq("id", item.id);
    setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: newQty } : c));
    fetchCartCount();
  };

  const removeItem = async (item) => {
    await supabase.from("cart").delete().eq("id", item.id);
    setCart(prev => prev.filter(c => c.id !== item.id));
    fetchCartCount();
    addToast(`${item.products?.name} removed`, "success");
  };

  const subtotal = cart.reduce((s, i) => s + Number(i.products?.price || 0) * i.quantity, 0);
  const gst      = Math.round(subtotal * 0.03);
  const total    = subtotal + gst;

  if (loading) return (
    <div className="cart-page">
      <div className="spinner-wrap" style={{ marginTop: 80 }}>
        <div className="spinner" />
        <p className="spinner-text">Loading your cart</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="cart-page">
      <div className="cart-empty">
        <div className="empty-icon">🔒</div>
        <h3>Sign in to view your cart</h3>
        <p>Your selections await you</p>
        <Link to="/login" className="btn-primary"><span>Sign In</span></Link>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="cart-page">
      <div className="cart-empty">
        <div className="empty-icon">✦</div>
        <h3>Your cart is empty</h3>
        <p>Discover our exclusive collection and find your perfect piece</p>
        <Link to="/" className="btn-primary"><span>Explore Collection</span></Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="cart-page">
        <div className="cart-header">
          <p className="section-label">Your Selection</p>
          <h1 className="section-title">Your <em>Cart</em></h1>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img
                  className="cart-item-img"
                  src={item.products?.image || FALLBACK_IMG}
                  alt={item.products?.name}
                  onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
                />
                <div>
                  <div className="cart-item-name">{item.products?.name}</div>
                  <div className="cart-item-price">
                    ₹ {Number(item.products?.price).toLocaleString("en-IN")} each
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item, -1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item, 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(item)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹ {subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: "var(--gold)" }}>Complimentary</span>
            </div>
            <div className="summary-row">
              <span>GST (3%)</span>
              <span>₹ {gst.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="amount">₹ {total.toLocaleString("en-IN")}</span>
            </div>

            <button className="checkout-btn" onClick={() => setShowAddress(true)}>
              <span>Proceed to Checkout</span>
            </button>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--flint)", letterSpacing: "0.1em" }}>
              🔒 &nbsp; Secure Checkout via Razorpay
            </div>
          </div>
        </div>
      </div>

      {showAddress && (
        <AddressModal
          onConfirm={(addr) => {
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
          gst={gst}
          total={total}
          shippingInfo={shippingInfo}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}