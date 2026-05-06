import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f5f1eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='%23c9907a' opacity='0.25'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;

const CATEGORY_META = {
  Anklets:   { icon: "✦", desc: "Delicate chains for graceful ankles" },
  Earrings:  { icon: "◈", desc: "From studs to chandelier drops" },
  Necklace:  { icon: "◆", desc: "Timeless pendants & layered pieces" },
  Bracelets: { icon: "◉", desc: "Stacked or solo, for every wrist" },
  Bangles:   { icon: "○", desc: "Traditional & contemporary bangles" },
  Minji:     { icon: "✿", desc: "Exclusive signature collection" },
};

function ProductItem({ product, onAddToCart, addingId }) {
  const [qty, setQty] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const adding = addingId === product.id;

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {/* Image */}
      <div style={{
        padding: "16px",
        background: "#f5f1eb",
        textAlign: "center"
      }}>
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "260px",
            objectFit: "contain",
            borderRadius: "8px"
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "18px",
          margin: "0 0 6px 0",
          fontWeight: "500"
        }}>
          {product.name}
        </h3>

        <p style={{
          color: "#a8705c",
          fontWeight: "600",
          margin: "0 0 12px 0"
        }}>
          ₹ {product.price}
        </p>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            fontSize: "12.5px",
            cursor: "pointer",
            padding: "4px 0",
            marginBottom: "8px",
            textAlign: "left"
          }}
        >
          {showDetails ? "Hide Details ▲" : "View Details ▼"}
        </button>

        {showDetails && (
          <div style={{
            fontSize: "13px",
            color: "#555",
            lineHeight: "1.5",
            marginBottom: "12px",
            flex: 1
          }}>
            {product.description && <p>{product.description}</p>}
            {product.material && <p><strong>Material:</strong> {product.material}</p>}
            {product.purity && <p><strong>Purity:</strong> {product.purity}</p>}
            {product.weight && <p><strong>Weight:</strong> {product.weight}</p>}
            {product.occasion && <p><strong>Occasion:</strong> {product.occasion}</p>}
          </div>
        )}

        {product.stock > 0 ? (
          <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
            <div style={{
              display: "flex",
              border: "1px solid #ddd",
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: "34px", background: "#f8f4f0" }}>-</button>
              <span style={{ padding: "0 12px", display: "flex", alignItems: "center" }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))} style={{ width: "34px", background: "#f8f4f0" }}>+</button>
            </div>

            <button
              disabled={adding}
              onClick={() => onAddToCart(product, qty)}
              style={{
                flex: 1,
                height: "46px",
                background: "#0d2818",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12.5px",
                letterSpacing: "0.5px",
                cursor: "pointer"
              }}
            >
              {adding ? "Adding..." : "ADD TO CART"}
            </button>
          </div>
        ) : (
          <div style={{
            height: "46px",
            background: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            color: "#777"
          }}>
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryModal({ category, products, onClose, onAddToCart, addingId }) {
  const meta = CATEGORY_META[category] || { icon: "◆", desc: "" };
  const modalRef = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 40, 24, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff",
        width: "100%",
        maxWidth: "1080px",           // Good size for laptop
        maxHeight: "90vh",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{
          background: "#0d2818",
          color: "white",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "42px" }}>{meta.icon}</span>
            <div>
              <p style={{ margin: "0", fontSize: "13px", opacity: "0.8" }}>COLLECTION</p>
              <h2 style={{ margin: "4px 0 6px 0", fontSize: "28px" }}>{category}</h2>
              <p style={{ margin: 0, opacity: "0.85" }}>{meta.desc}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Products Grid */}
        <div style={{
          padding: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "28px",
          overflowY: "auto",
          flex: 1,
          background: "#f8f4f0"
        }}>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "60px", margin: "0 0 20px 0" }}>{meta.icon}</p>
              <p>New pieces arriving soon</p>
            </div>
          ) : (
            products.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductItem 
                  product={p} 
                  onAddToCart={onAddToCart} 
                  addingId={addingId} 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Products({ onModalChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const { fetchCartCount, user, addToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { onModalChange?.(!!openCategory); }, [openCategory]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    setProducts(data || []);
    setLoading(false);
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) { addToast("Please sign in to add items", "error"); navigate("/login"); return; }
    if (product.stock === 0) { addToast("Out of stock", "error"); return; }

    setAddingId(product.id);

    const { data: existing } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("cart").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({ user_id: user.id, product_id: product.id, quantity: qty });
    }

    await fetchCartCount();
    addToast(`${product.name} × ${qty} added`, "success");
    setAddingId(null);
  };

  const byCategory = Object.keys(CATEGORY_META).reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});

  const totalItems = products.length;

  return (
    <section id="products" className="products">
      <div style={{ textAlign: "center", padding: "40px 20px 20px" }}>
        <p style={{ color: "#a8705c", letterSpacing: "2px", margin: 0 }}>Fine Jewellery</p>
        <h2 style={{ fontSize: "42px", margin: "12px 0 8px" }}>Our <em>Collections</em></h2>
        <p style={{ color: "#666", maxWidth: "600px", margin: "0 auto" }}>
          {loading ? "Loading…" : `${totalItems} handcrafted pieces across 6 collections`}
        </p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "28px",
        padding: "20px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {Object.entries(CATEGORY_META).map(([cat, meta], i) => {
          const catProducts = byCategory[cat] || [];
          const count = catProducts.length;
          const featured = catProducts.find(p => p.stock > 0 && p.image) || catProducts[0];

          return (
            <button
              key={cat}
              onClick={() => setOpenCategory(cat)}
              style={{
                height: "420px",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                background: "#fff",
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                border: "none",
                cursor: "pointer",
                animationDelay: `${i * 0.08}s`
              }}
            >
              <div style={{ height: "65%", position: "relative" }}>
                {featured?.image ? (
                  <img
                    src={featured.image}
                    alt={cat}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => e.currentTarget.style.display = "none"}
                  />
                ) : (
                  <div style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "80px",
                    background: "#f5f1eb"
                  }}>
                    {meta.icon}
                  </div>
                )}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(13,40,24,0.7), transparent)"
                }} />
              </div>

              <div style={{ padding: "20px", textAlign: "left", height: "35%" }}>
                <span style={{ fontSize: "28px" }}>{meta.icon}</span>
                <h3 style={{ margin: "8px 0 6px", fontSize: "22px" }}>{cat}</h3>
                <p style={{ color: "#666", fontSize: "14.5px", marginBottom: "12px" }}>{meta.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#a8705c" }}>
                    {loading ? "…" : count === 0 ? "Coming soon" : `${count} piece${count !== 1 ? "s" : ""}`}
                  </span>
                  <span style={{ fontSize: "18px" }}>→</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {openCategory && (
        <CategoryModal
          category={openCategory}
          products={byCategory[openCategory] || []}
          onClose={() => setOpenCategory(null)}
          onAddToCart={addToCart}
          addingId={addingId}
        />
      )}
    </section>
  );
}