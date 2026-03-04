import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-info">
        <div className="skeleton-line med" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const { fetchCartCount, user, addToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const addToCart = async (product) => {
    if (!user) {
      addToast("Please sign in to add items to your cart", "error");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      addToast("This item is out of stock", "error");
      return;
    }

    setAddingId(product.id);

    // Check if item already in cart → upsert quantity
    const { data: existing } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single();

    if (existing) {
      await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });
    }

    await fetchCartCount();
    addToast(`${product.name} added to cart`, "success");
    setAddingId(null);
  };

  return (
    <section id="products" className="products">
      <div className="products-header">
        <p className="section-label">Featured Pieces</p>
        <h2 className="section-title">The <em>Collection</em></h2>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-image-wrap">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                    💎
                  </div>
                )}
                <div className="product-overlay" />
                <span className={`product-stock-badge ${p.stock === 0 ? "out" : ""}`}>
                  {p.stock === 0 ? "Sold Out" : `${p.stock} left`}
                </span>
              </div>

              <div className="product-info">
                <div className="product-meta">
                  <h3>{p.name}</h3>
                  <p className="product-price">₹ {Number(p.price).toLocaleString("en-IN")}</p>
                </div>
                <button
                  className="add-to-cart-btn"
                  disabled={p.stock === 0 || addingId === p.id}
                  onClick={() => addToCart(p)}
                >
                  {addingId === p.id ? "Adding…" : p.stock === 0 ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
