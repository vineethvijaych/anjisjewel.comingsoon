import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartBar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const hidden = ["/cart", "/success"].includes(location.pathname);
  if (hidden || cartCount === 0) return null;

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0d2818",
        borderTop: "1px solid rgba(201,144,122,0.2)",
        padding: "12px 16px",
        zIndex: 9999, // 🔥 ABOVE MODAL
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#fff",
          fontSize: "13px",
        }}
      >
        <span>
          ✦ {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={scrollToProducts}
          style={{
            flex: 1,
            height: "42px",
            background: "transparent",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Continue
        </button>

        <button
          onClick={() => navigate("/cart")}
          style={{
            flex: 1.5,
            height: "42px",
            background: "#c9907a",
            color: "#fff",
            border: "none",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          View Cart →
        </button>
      </div>
    </div>
  );
}