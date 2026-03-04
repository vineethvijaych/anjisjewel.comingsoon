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

// ─── Product Item inside modal ───
function ProductItem({ product, onAddToCart, addingId }) {
  const [qty, setQty] = useState(1);
  const adding = addingId === product.id;

  return (
    <div className="pm-product-item">
      <div className="pm-product-img-wrap">
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
        />
        {product.stock === 0 && <div className="pm-sold-overlay">Sold Out</div>}
      </div>

      <div className="pm-product-body">
        <div className="pm-product-top">
          <div>
            <h3 className="pm-product-name">{product.name}</h3>
            {product.material && (
              <p className="pm-product-meta">
                {[product.material, product.purity, product.weight].filter(Boolean).join(" · ")}
              </p>
            )}
            {product.description && <p className="pm-product-desc">{product.description}</p>}
          </div>
          <p className="pm-product-price">₹ {Number(product.price).toLocaleString("en-IN")}</p>
        </div>

        {product.stock > 0 ? (
          <div className="pm-product-actions">
            {/* Quantity control */}
            <div className="pm-qty-control">
              <button
                className="pm-qty-btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >−</button>
              <span className="pm-qty-value">{qty}</span>
              <button
                className="pm-qty-btn"
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
              >+</button>
              <span className="pm-qty-stock">{product.stock} left</span>
            </div>

            {/* Add to cart */}
            <button
              className="pm-add-btn"
              disabled={adding}
              onClick={() => onAddToCart(product, qty)}
            >
              <span>{adding ? "Adding…" : `Add to Cart`}</span>
            </button>
          </div>
        ) : (
          <p className="pm-out-stock">Out of Stock</p>
        )}
      </div>
    </div>
  );
}

// ─── Category Products Modal ───
function CategoryModal({ category, products, onClose, onAddToCart, addingId }) {
  const meta = CATEGORY_META[category] || { icon: "◆", desc: "" };
  const modalRef = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="pm-backdrop" onClick={handleBackdrop}>
      <div className="pm-modal" ref={modalRef}>
        {/* Modal Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <span className="pm-header-icon">{meta.icon}</span>
            <div>
              <p className="pm-header-label">Collection</p>
              <h2 className="pm-header-title">{category}</h2>
              <p className="pm-header-desc">{meta.desc}</p>
            </div>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        {/* Products list */}
        <div className="pm-products-list">
          {products.length === 0 ? (
            <div className="pm-empty">
              <span className="pm-empty-icon">{meta.icon}</span>
              <p className="pm-empty-text">New pieces arriving soon</p>
              <p className="pm-empty-sub">Check back for our latest {category.toLowerCase()} collection</p>
            </div>
          ) : (
            products.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 0.06}s` }}
                className="pm-item-wrapper"
              >
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

// ─── Main Products Section ───
export default function Products() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [openCategory, setOpenCategory]   = useState(null);
  const [addingId, setAddingId]           = useState(null);
  const { fetchCartCount, user, addToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setProducts(data || []);
    setLoading(false);
  };

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      addToast("Please sign in to add items to your cart", "error");
      navigate("/login");
      return;
    }
    if (product.stock === 0) { addToast("This item is out of stock", "error"); return; }

    setAddingId(product.id);

    const { data: existing } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("cart")
        .update({ quantity: existing.quantity + qty })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({
        user_id: user.id, product_id: product.id, quantity: qty,
      });
    }

    await fetchCartCount();
    addToast(`${product.name} × ${qty} added to cart ✦`, "success");
    setAddingId(null);
  };

  // Group products by category
  const byCategory = Object.keys(CATEGORY_META).reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});

  const totalItems = products.length;

  return (
    <section id="products" className="products">
      {/* Section header */}
      <div className="products-header">
        <p className="section-label">Fine Jewellery</p>
        <h2 className="section-title">Our <em>Collections</em></h2>
        <p className="products-subtitle">
          {loading ? "Loading…" : `${totalItems} handcrafted pieces across 6 collections`}
        </p>
      </div>

      {/* Category grid — the MAIN UI */}
      <div className="cat-grid">
        {Object.entries(CATEGORY_META).map(([cat, meta], i) => {
          const catProducts = byCategory[cat] || [];
          const count = catProducts.length;
          // pick a featured image: first in-stock product image
          const featured = catProducts.find(p => p.stock > 0 && p.image) || catProducts[0];

          return (
            <button
              key={cat}
              className="cat-card"
              onClick={() => setOpenCategory(cat)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Background image */}
              <div className="cat-card-bg">
                {featured?.image ? (
                  <img
                    src={featured.image}
                    alt={cat}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="cat-card-placeholder">{meta.icon}</div>
                )}
                <div className="cat-card-overlay" />
              </div>

              {/* Content */}
              <div className="cat-card-content">
                <span className="cat-card-icon">{meta.icon}</span>
                <h3 className="cat-card-name">{cat}</h3>
                <p className="cat-card-desc">{meta.desc}</p>
                <div className="cat-card-footer">
                  <span className="cat-card-count">
                    {loading ? "…" : count === 0 ? "Coming soon" : `${count} piece${count !== 1 ? "s" : ""}`}
                  </span>
                  <span className="cat-card-arrow">→</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category modal */}
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