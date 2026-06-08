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
        background: "#08120c", // Deep Emerald
        borderTop: "1px solid rgba(201, 160, 124, 0.25)",
        padding: "16px 20px",
        zIndex: 9999,
        boxShadow: "0 -10px 40px rgba(8, 18, 12, 0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#f4f1ec", // Ivory
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontFamily: "'Jost', system-ui, sans-serif",
            fontSize: "15px",
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>✦</span>
          {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "15px",
            color: "#d8b08b", // Soft Gold
            fontWeight: 500,
          }}
        >
          ANJIS JEWEL
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {/* Secondary Button - Continue Shopping */}
        <button
          onClick={scrollToProducts}
          style={{
            flex: 1,
            height: "52px",
            background: "transparent",
            color: "#d8b08b",
            border: "1px solid rgba(216, 176, 139, 0.5)",
            borderRadius: "8px",
            fontFamily: "'Jost', system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(216, 176, 139, 0.08)";
            e.currentTarget.style.borderColor = "#d8b08b";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(216, 176, 139, 0.5)";
          }}
        >
          Continue Shopping
        </button>

        {/* Primary Button - View Cart */}
        <button
          onClick={() => navigate("/cart")}
          style={{
            flex: 1.35,
            height: "52px",
            background: "#c9a07c", // Luxury Gold
            color: "#08120c", // Deep Emerald
            border: "none",
            borderRadius: "8px",
            fontFamily: "'Jost', system-ui, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(201, 160, 124, 0.35)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#d8b08b";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#c9a07c";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          View Cart →
        </button>
      </div>
    </div>
  );
}