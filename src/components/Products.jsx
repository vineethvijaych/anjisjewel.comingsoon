import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%231a2a1f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='%23c9a07c' opacity='0.35'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;

const DEFAULT_CATEGORIES = [
  { name: "Anklets", icon: "✦", desc: "Delicate chains for graceful ankles", sort_order: 1 },
  { name: "Earrings", icon: "◈", desc: "From studs to chandelier drops", sort_order: 2 },
  { name: "Necklace", icon: "◆", desc: "Timeless pendants & layered pieces", sort_order: 3 },
  { name: "Bracelets", icon: "◉", desc: "Stacked or solo, for every wrist", sort_order: 4 },
  { name: "Bangles", icon: "○", desc: "Traditional & contemporary bangles", sort_order: 5 },
  { name: "Minji", icon: "✿", desc: "Exclusive signature collection", sort_order: 6 },
  { name: "Hip Chain", icon: "❖", desc: "Elegant waist chains with modern charm", sort_order: 7 },
  { name: "Hair Accessories", icon: "❀", desc: "Stylish pieces to complete your hairstyle", sort_order: 8 },
  { name: "Finger Ring", icon: "◍", desc: "Minimal to statement rings for every style", sort_order: 9 },
];

function normalizeCategory(category, index = 0) {
  return {
    id: category.id || category.name,
    name: category.name,
    icon: category.icon || "◆",
    desc: category.description || category.desc || "Handpicked jewellery collection",
    image: category.image || "",
    sort_order: category.sort_order ?? index + 1,
  };
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#08120c",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "24px"
    }}>
      <div style={{
        width: "60px",
        height: "60px",
        border: "2px solid rgba(201, 160, 124, 0.2)",
        borderTop: "2px solid #c9a07c",
        borderRadius: "50%",
        animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite"
      }} />
      <div style={{
        width: "120px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #c9a07c, transparent)",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <p style={{
        color: "#c9a07c",
        fontFamily: "Jost, sans-serif",
        fontSize: "11px",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        margin: 0
      }}>Loading Collections</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; width: 60px; }
          50% { opacity: 1; width: 120px; }
        }
      `}</style>
    </div>
  );
}

function ImageZoomModal({ product, onClose }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!product) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(8, 18, 12, 0.96)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 20, borderBottom: "1px solid rgba(201, 160, 124, 0.3)", paddingBottom: 12 }}>
          <div>
            <p style={{ color: "#c9a07c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", margin: 0, fontWeight: 400 }}>Image Preview</p>
            <h3 style={{ color: "#f4f1ec", margin: "6px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 400 }}>{product.name}</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: "rgba(201, 160, 124, 0.12)", 
              color: "#c9a07c", 
              border: "1px solid rgba(201, 160, 124, 0.3)", 
              borderRadius: "50%", 
              width: 44, 
              height: 44, 
              fontSize: 20,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>
        </div>

        <div 
          style={{ 
            background: "#0d2818", 
            overflow: "auto", 
            height: "min(70vh, 620px)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            border: "1px solid rgba(201, 160, 124, 0.2)"
          }}
        >
          <img
            src={product.image || FALLBACK_IMG}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transform: `scale(${zoom})`,
              transition: "transform 0.25s ease",
              cursor: zoom > 1 ? "grab" : "zoom-in",
            }}
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <button onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))} style={zoomBtnStyle}>−</button>
          <button onClick={() => setZoom(1)} style={{...zoomBtnStyle, minWidth: 65}}>Reset</button>
          <button onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))} style={zoomBtnStyle}>+</button>
        </div>
      </div>
    </div>
  );
}

const zoomBtnStyle = {
  background: "transparent",
  border: "1px solid rgba(201, 160, 124, 0.4)",
  color: "#c9a07c",
  padding: "8px 18px",
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: "0.1em",
  cursor: "pointer",
  fontFamily: "Jost, sans-serif",
  transition: "all 0.3s ease",
};

function ProductItem({ product, onAddToCart, addingId, onImageOpen, onShare }) {
  const [qty, setQty] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const adding = addingId === product.id;

  return (
    <div style={{
      background: "#0d2818",
      border: "1px solid rgba(201, 160, 124, 0.2)",
      transition: "all 0.4s ease",
      display: "flex",
      overflow: "hidden",
      flexDirection: "column",
      height: "100%",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#c9a07c";
      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
      e.currentTarget.style.transform = "translateY(-4px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.2)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}
    >
      <button
        onClick={() => onImageOpen(product)}
        aria-label={`Open ${product.name} image`}
        style={{ padding: "20px 16px 16px", background: "#08120c", textAlign: "center", border: "none", position: "relative", cursor: "pointer" }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "240px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imgLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#0a1a12",
              }}
            >
              <div
                style={{
                  width: "40%",
                  height: "100%",
                  background: "linear-gradient(to right, transparent, rgba(201, 160, 124, 0.1), transparent)",
                  animation: "shimmer 1.2s infinite",
                }}
              />
            </div>
          )}

          <img
            src={product.image || FALLBACK_IMG}
            alt={product.name}
            loading="lazy"
            onLoad={(e) => {
              e.currentTarget.style.opacity = "1";
              setImgLoading(false);
            }}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
              e.currentTarget.style.opacity = "1";
              setImgLoading(false);
            }}
            style={{
              width: "100%",
              height: "240px",
              objectFit: "contain",
              opacity: 0,
              transition: "opacity 0.5s ease",
              display: "block",
            }}
          />
        </div>
        <span style={{ 
          position: "absolute", 
          right: 16, 
          bottom: 16, 
          background: "rgba(8, 18, 12, 0.85)", 
          color: "#c9a07c", 
          padding: "4px 12px", 
          fontSize: 9,
          letterSpacing: "0.15em",
          fontFamily: "Jost, sans-serif",
          border: "1px solid rgba(201, 160, 124, 0.3)"
        }}>
          ZOOM
        </span>
      </button>

      <div style={{ padding: "20px 16px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h3 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "18px",
            margin: "0 0 4px 0",
            fontWeight: "500",
            color: "#f4f1ec",
          }}>
            {product.name}
          </h3>
          <button
            onClick={() => onShare(product)}
            title="Share product"
            style={{ 
              background: "transparent", 
              color: "#c9a07c", 
              border: "1px solid rgba(201, 160, 124, 0.35)", 
              padding: "4px 12px", 
              fontSize: 9, 
              whiteSpace: "nowrap",
              fontFamily: "Jost, sans-serif",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            SHARE
          </button>
        </div>

        <p style={{ color: "#c9a07c", fontWeight: "500", margin: "4px 0 12px 0", fontSize: "16px", fontFamily: "Jost, sans-serif" }}>
          ₹ {Number(product.price || 0).toLocaleString("en-IN")}
        </p>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: "none",
            border: "none",
            color: "#c9a07c",
            fontSize: "9px",
            letterSpacing: "0.15em",
            cursor: "pointer",
            padding: "6px 0",
            marginBottom: "10px",
            textAlign: "left",
            fontFamily: "Jost, sans-serif",
            textTransform: "uppercase",
          }}
        >
          {showDetails ? "− HIDE DETAILS" : "+ VIEW DETAILS"}
        </button>

        {showDetails && (
          <div style={{ fontSize: "12px", color: "#d6d0c7", lineHeight: "1.5", marginBottom: "16px", flex: 1, fontFamily: "Jost, sans-serif", borderTop: "1px solid rgba(201, 160, 124, 0.15)", paddingTop: "10px" }}>
            {product.description && <p style={{ margin: "0 0 6px" }}>{product.description}</p>}
            {product.material && <p style={{ margin: "2px 0" }}><span style={{ color: "#c9a07c" }}>Material:</span> {product.material}</p>}
            {product.purity && <p style={{ margin: "2px 0" }}><span style={{ color: "#c9a07c" }}>Purity:</span> {product.purity}</p>}
            {product.weight && <p style={{ margin: "2px 0" }}><span style={{ color: "#c9a07c" }}>Weight:</span> {product.weight}</p>}
          </div>
        )}

        {product.stock > 0 ? (
          <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
            <div style={{ display: "flex", border: "1px solid rgba(201, 160, 124, 0.35)" }}>
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))} 
                style={{ 
                  width: "34px", 
                  background: "transparent", 
                  color: "#c9a07c",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >−</button>
              <span style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "#f4f1ec", fontFamily: "Jost, sans-serif", fontSize: "13px" }}>{qty}</span>
              <button 
                onClick={() => setQty(q => Math.min(product.stock, q + 1))} 
                style={{ 
                  width: "34px", 
                  background: "transparent", 
                  color: "#c9a07c",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >+</button>
            </div>

            <button
              disabled={adding}
              onClick={() => onAddToCart(product, qty)}
              style={{
                flex: 1,
                height: "42px",
                background: "transparent",
                color: "#c9a07c",
                border: "1px solid #c9a07c",
                fontSize: "9px",
                letterSpacing: "0.2em",
                cursor: adding ? "not-allowed" : "pointer",
                opacity: adding ? 0.5 : 1,
                fontFamily: "Jost, sans-serif",
                fontWeight: 500,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                if (!adding) {
                  e.currentTarget.style.background = "#c9a07c";
                  e.currentTarget.style.color = "#08120c";
                }
              }}
              onMouseLeave={(e) => {
                if (!adding) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#c9a07c";
                }
              }}
            >
              {adding ? "ADDING..." : "ADD TO CART"}
            </button>
          </div>
        ) : (
          <div style={{ 
            height: "42px", 
            background: "rgba(201, 160, 124, 0.06)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#c9a07c", 
            marginTop: "auto",
            border: "1px solid rgba(201, 160, 124, 0.15)",
            fontFamily: "Jost, sans-serif",
            fontSize: "9px",
            letterSpacing: "0.15em"
          }}>
            OUT OF STOCK
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryModal({ category, products, onClose, onAddToCart, addingId, onImageOpen, onShare }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(8, 18, 12, 0.96)",
        backdropFilter: "blur(8px)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 1000, 
        padding: "16px" 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        style={{ 
          background: "#08120c", 
          width: "100%", 
          maxWidth: "1200px", 
          maxHeight: "90vh", 
          overflow: "hidden", 
          display: "flex", 
          flexDirection: "column", 
          border: "1px solid rgba(201, 160, 124, 0.2)"
        }}
      >
        {/* Modal Header */}
        <div style={{ 
          background: "#0d2818", 
          padding: "24px 28px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          borderBottom: "1px solid rgba(201, 160, 124, 0.3)"
        }}>
          <div>
            <p style={{ 
              color: "#c9a07c", 
              fontSize: 10, 
              letterSpacing: "0.3em", 
              margin: "0 0 6px",
              fontFamily: "Jost, sans-serif",
              textTransform: "uppercase"
            }}>
              {category.icon} COLLECTION
            </p>
            <h2 style={{ 
              margin: "0", 
              fontSize: "clamp(28px, 6vw, 38px)", 
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: "400",
              color: "#f4f1ec",
            }}>
              {category.name}
            </h2>
            {category.desc && (
              <p style={{ 
                margin: "10px 0 0", 
                color: "#d6d0c7", 
                fontSize: 13,
                fontFamily: "Jost, sans-serif",
                maxWidth: "450px",
                lineHeight: 1.4
              }}>
                {category.desc}
              </p>
            )}
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              background: "rgba(201, 160, 124, 0.1)", 
              border: "1px solid rgba(201, 160, 124, 0.3)", 
              color: "#c9a07c", 
              fontSize: "20px", 
              cursor: "pointer",
              width: "42px",
              height: "42px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Product Grid - No horizontal scroll on mobile */}
        <div 
          style={{ 
            padding: "32px 28px", 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "28px", 
            overflowY: "auto", 
            flex: 1,
            background: "#08120c",
            maxWidth: "100%",
            boxSizing: "border-box"
          }}
        >
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", gridColumn: "1 / -1" }}>
              <p style={{ fontSize: "40px", margin: "0 0 16px 0", color: "#c9a07c", opacity: 0.4 }}>{category.icon}</p>
              <p style={{ color: "#d6d0c7", fontFamily: "Jost, sans-serif", fontSize: 13 }}>New pieces arriving soon</p>
            </div>
          ) : (
            products.map((p, i) => (
              <div key={p.id}>
                <ProductItem
                  product={p}
                  onAddToCart={onAddToCart}
                  addingId={addingId}
                  onImageOpen={onImageOpen}
                  onShare={onShare}
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
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(normalizeCategory));
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [zoomProduct, setZoomProduct] = useState(null);

  const { fetchCartCount, user, addToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => { loadStorefront(); }, []);
  useEffect(() => { onModalChange?.(!!openCategory || !!zoomProduct); }, [openCategory, zoomProduct, onModalChange]);

  const loadStorefront = async () => {
    setLoading(true);

    const [{ data: productData, error: productError }, { data: categoryData, error: categoryError }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    ]);

    if (productError) console.error(productError);
    if (categoryError) console.error("Categories table not ready, using defaults:", categoryError.message);

    const activeCategories = (categoryData || [])
      .filter(c => c.is_active !== false && c.name)
      .map(normalizeCategory);

    setProducts(productData || []);
    setCategories(activeCategories.length ? activeCategories : DEFAULT_CATEGORIES.map(normalizeCategory));
    setLoading(false);
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      addToast("Please sign in to continue", "error");
      navigate("/login", {
        state: {
          redirectTo: window.location.pathname,
        },
      });
      return;
    }
    if (product.stock === 0) { addToast("Out of stock", "error"); return; }

    setAddingId(product.id);

    try {
      const { data: existing } = await supabase
        .from("cart")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        await supabase.from("cart").update({ quantity: nextQty }).eq("id", existing.id);
      } else {
        await supabase.from("cart").insert({ user_id: user.id, product_id: product.id, quantity: qty });
      }

      await fetchCartCount();
      addToast(`${product.name} × ${qty} added`, "success");
    } finally {
      setAddingId(null);
    }
  };

  const shareProduct = async (product) => {
    const url = `${window.location.origin}/product/${product.id}`;
    const shareData = { title: product.name, text: `View ${product.name} on AnjisJewel`, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        addToast("Product link copied", "success");
      }
    } catch (error) {
      if (error.name !== "AbortError") addToast("Unable to share product", "error");
    }
  };

  const byCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.name] = products.filter(p => p.category === cat.name);
      return acc;
    }, {});
  }, [categories, products]);

  const totalItems = products.length;

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(350%); }
          }
          
          * {
            box-sizing: border-box;
          }
        `}
      </style>

      <section
        id="products"
        className="products"
        style={{
          background: "#f8f4ef",
          padding: "80px 0",
          overflowX: "hidden",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px 16px 20px" }}>
          <p style={{ color: "#c9a07c", letterSpacing: "3px", margin: 0, fontFamily: "Jost, sans-serif", fontSize: 11 }}>FINE JEWELLERY</p>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: "500",
              color: "#0d2818",
              margin: "12px 0 10px",
            }}
          >
            Discover Our Collections
          </h2>
          <p style={{ color: "#8a7a6a", maxWidth: "500px", margin: "0 auto", fontFamily: "Jost, sans-serif", fontSize: 13 }}>
            {`${totalItems} handcrafted pieces across ${categories.length} collection${categories.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Category Grid - Responsive with no horizontal scroll */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "24px", 
          padding: "16px 24px", 
          maxWidth: "1400px", 
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box"
        }}>
          {categories.map((cat, i) => {
            const catProducts = byCategory[cat.name] || [];
            const count = catProducts.length;
            const featured = cat.image ? { image: cat.image } : (catProducts.find(p => p.stock > 0 && p.image) || catProducts[0]);

            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setOpenCategory(cat)}
                style={{ 
                  height: "420px",
                  padding: "0", 
                  overflow: "hidden", 
                  position: "relative", 
                  background: "#fff", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)", 
                  border: "none", 
                  cursor: "pointer",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                }}
              >
                <div style={{ height: "60%", position: "relative", overflow: "hidden" }}>
                  {featured?.image ? (
                    <img
                      src={featured.image}
                      alt={cat.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      onError={e => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", background: "#f5f1eb" }}>
                      {cat.icon}
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,40,24,0.5), transparent)" }} />
                </div>

                <div style={{ padding: "20px", textAlign: "left", height: "40%", background: "#fff" }}>
                  <span style={{ fontSize: "20px", color: "#c9a07c" }}>{cat.icon}</span>
                  <h3
                    style={{
                      margin: "6px 0 6px",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "22px",
                      fontWeight: "500",
                      color: "#0d2818",
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p style={{ color: "#8a7a6a", fontSize: "12px", marginBottom: "10px", fontFamily: "Jost, sans-serif", lineHeight: 1.4 }}>{cat.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#c9a07c", letterSpacing: "0.08em", fontFamily: "Jost, sans-serif" }}>
                      {count === 0 ? "COMING SOON" : `${count} PIECE${count !== 1 ? "S" : ""}`}
                    </span>
                    <span style={{ fontSize: "18px", color: "#c9a07c" }}>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {openCategory && (
          <CategoryModal
            category={openCategory}
            products={byCategory[openCategory.name] || []}
            onClose={() => setOpenCategory(null)}
            onAddToCart={addToCart}
            addingId={addingId}
            onImageOpen={setZoomProduct}
            onShare={shareProduct}
          />
        )}

        {zoomProduct && (
          <ImageZoomModal
            product={zoomProduct}
            onClose={() => setZoomProduct(null)}
          />
        )}
      </section>
    </>
  );
}