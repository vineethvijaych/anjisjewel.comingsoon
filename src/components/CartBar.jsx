import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartBar() {
  const { cartCount } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  const hidden = ["/cart", "/success"].includes(location.pathname);
  if (hidden || cartCount === 0) return null;

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="cart-bar">
      <div className="cart-bar-left">
        <span className="cart-bar-icon">✦</span>
        <span className="cart-bar-count">
          {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </span>
      </div>
      <div className="cart-bar-actions">
        <button className="cart-bar-btn ghost" onClick={scrollToProducts}>
          Continue Shopping
        </button>
        <button className="cart-bar-btn primary" onClick={() => navigate("/cart")}>
          View Cart →
        </button>
      </div>
    </div>
  );
}