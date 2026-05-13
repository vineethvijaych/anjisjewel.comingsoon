
import { useEffect, useMemo, useState } from "react";
 import { supabase } from "../supabase";
 import { useCart } from "../context/CartContext";
 import { useNavigate } from "react-router-dom";
 
 const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f5f1eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='%23c9907a' opacity='0.25'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;
 

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
    image: category.image | "",
    sort_order: category.sort_order ?? index + 1,
  };
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
      background: "rgba(13, 40, 24, 0.96)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div style={{ width: "100%", maxWidth: "980px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", margin: 0 }}>Image Preview</p>
          <h3 style={{ color: "#fff", margin: "4px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontWeight: 400 }}>{product.name}</h3>
        </div>
        <button onClick={onClose} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, width: 44, height: 44, fontSize: 24 }}>×</button>
      </div>

      <div style={{ background: "#f5f1eb", borderRadius: 16, overflow: "auto", height: "min(72vh, 720px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transform: `scale(${zoom})`,
            transition: "transform 0.18s ease",
            cursor: zoom > 1 ? "move" : "zoom-in",
          }}
          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))} style={zoomBtnStyle}>− Zoom</button>
        <button onClick={() => setZoom(1)} style={zoomBtnStyle}>Reset</button>
        <button onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))} style={zoomBtnStyle}>+ Zoom</button>
      </div>
    </div>
  </div>
);
}

const zoomBtnStyle = {
background: "#fff",
color: "#0d2818",
border: "none",
borderRadius: 999,
padding: "10px 18px",
fontSize: 13,
fontWeight: 600,
 };
 
function ProductItem({ product, onAddToCart, addingId, onImageOpen, onShare }) {
   const [qty, setQty] = useState(1);
   const [showDetails, setShowDetails] = useState(false);
   
   const [imgLoading, setImgLoading] = useState(true);
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
    <button
      onClick={() => onImageOpen(product)}
      aria-label={`Open ${product.name} image`}
      style={{ padding: "16px", background: "#f5f1eb", textAlign: "center", border: "none", position: "relative" }}
    >
        <div
  style={{
    position: "relative",
    width: "100%",
    minHeight: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  {/* LOADING SKELETON */}
  {imgLoading && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "8px",
        overflow: "hidden",
        background: "#ece7df",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "100%",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)",
          animation: "shimmer 1.2s infinite",
        }}
      />
    </div>
  )}

  <img
    src={product.image || FALLBACK_IMG}
    alt={product.name}
    loading="lazy"
    decoding="async"
    onLoad={() => setImgLoading(false)}
    onError={(e) => {
      e.currentTarget.src = FALLBACK_IMG;
      setImgLoading(false);
    }}
    style={{
      width: "100%",
      height: "auto",
      maxHeight: "260px",
      objectFit: "contain",
      borderRadius: "8px",
      opacity: imgLoading ? 0 : 1,
      transition: "opacity 0.35s ease",
    }}
  />
</div>
      <span style={{ position: "absolute", right: 22, bottom: 22, background: "rgba(13,40,24,0.86)", color: "#fff", borderRadius: 999, padding: "6px 10px", fontSize: 11 }}>
        Tap to zoom
      </span>
    </button>
 
       <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <h3 style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "18px",
          margin: "0 0 6px 0",
          fontWeight: "500"
        }}>
          {product.name}
        </h3>
        <button
          onClick={() => onShare(product)}
          title="Share product"
          style={{ background: "#f8f4f0", color: "#0d2818", border: "1px solid #eadfd4", borderRadius: 999, padding: "6px 10px", fontSize: 12, whiteSpace: "nowrap" }}
        >
          Share
        </button>
      </div>

      <p style={{ color: "#a8705c", fontWeight: "600", margin: "0 0 12px 0" }}>
        ₹ {Number(product.price || 0).toLocaleString("en-IN")}
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

        <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "12px", flex: 1 }}>
             {product.description && <p>{product.description}</p>}
             {product.material && <p><strong>Material:</strong> {product.material}</p>}
             {product.purity && <p><strong>Purity:</strong> {product.purity}</p>}
             {product.weight && <p><strong>Weight:</strong> {product.weight}</p>}
             {product.occasion && <p><strong>Occasion:</strong> {product.occasion}</p>}
          {product.details && <p>{product.details}</p>}
           </div>
         )}
 
         {product.stock > 0 ? (
           <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>

          <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: "34px", background: "#f8f4f0" }}>-</button>
               <span style={{ padding: "0 12px", display: "flex", alignItems: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: "34px", background: "#f8f4f0" }}>+</button>
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
              cursor: adding ? "not-allowed" : "pointer",
              opacity: adding ? 0.7 : 1,
               }}
             >
               {adding ? "Adding..." : "ADD TO CART"}
             </button>
           </div>
         ) : (

        <div style={{ height: "46px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#777", marginTop: "auto" }}>
             Out of Stock
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
    style={{ position: "fixed", inset: 0, background: "rgba(13, 40, 24, 0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
       onClick={(e) => e.target === e.currentTarget && onClose()}
     >


    <div style={{ background: "#fff", width: "100%", maxWidth: "1080px", maxHeight: "90vh", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ background: "#0d2818", color: "white", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
           <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "42px" }}>{category.icon}</span>
             <div>
            <h2 style={{ margin: "4px 0 6px 0", fontSize: "28px" }}>{category.name}</h2>
            {category.desc && <p style={{ margin: 0, opacity: "0.78", fontSize: 13 }}>{category.desc}</p>}
             </div>
           </div>

        <button onClick={onClose} style={{ background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer" }}>✕</button>
         </div>
 

      <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px", overflowY: "auto", flex: 1, background: "#f8f4f0" }}>
           {products.length === 0 ? (
             <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "60px", margin: "0 0 20px 0" }}>{category.icon}</p>
               <p>New pieces arriving soon</p>
             </div>
           ) : (
             products.map((p, i) => (
               <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
              
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
}     if (product.stock === 0) { addToast("Out of stock", "error"); return; }
 
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
 
   return (
  <>
    <style>
      {`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%);
          }

          100% {
            transform: translateX(350%);
          }
        }
      `}
    </style>

    <section id="products" className="products">
       <div style={{ textAlign: "center", padding: "40px 20px 20px" }}>
         <p style={{ color: "#a8705c", letterSpacing: "2px", margin: 0 }}>Fine Jewellery</p>
         <h2 style={{ fontSize: "42px", margin: "12px 0 8px" }}>Our <em>Collections</em></h2>
         <p style={{ color: "#666", maxWidth: "600px", margin: "0 auto" }}>
        {loading ? "Loading…" : `${totalItems} handcrafted pieces across ${categories.length} collection${categories.length === 1 ? "" : "s"}`}
         </p>
       </div>
 

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px", padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {categories.map((cat, i) => {
        const catProducts = byCategory[cat.name] || [];
           const count = catProducts.length;
        const featured = cat.image ? { image: cat.image } : (catProducts.find(p => p.stock > 0 && p.image) || catProducts[0]);
 
           return (
             <button
            key={cat.id || cat.name}
               onClick={() => setOpenCategory(cat)}
            style={{ height: "420px", borderRadius: "16px", overflow: "hidden", position: "relative", background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.12)", border: "none", cursor: "pointer", animationDelay: `${i * 0.08}s` }}
             >
               <div style={{ height: "65%", position: "relative" }}>
                 {featured?.image ? (
                   <img
                     src={featured.image}
                  alt={cat.name}
                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.currentTarget.style.display = "none"; }}
                   />
                 ) : (

                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px", background: "#f5f1eb" }}>
                  {cat.icon}
                   </div>
                 )}

              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,40,24,0.7), transparent)" }} />
               </div>
 
               <div style={{ padding: "20px", textAlign: "left", height: "35%" }}>
              <span style={{ fontSize: "28px" }}>{cat.icon}</span>
              <h3 style={{ margin: "8px 0 6px", fontSize: "22px" }}>{cat.name}</h3>
              <p style={{ color: "#666", fontSize: "14.5px", marginBottom: "12px" }}>{cat.desc}</p>
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
 
