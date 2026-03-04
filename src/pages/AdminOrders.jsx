import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "vineethcpz6881@gmail.com";

const CATEGORIES = ["Anklets", "Earrings", "Necklace", "Bracelets", "Bangles", "Minji"];

const STATUS_COLORS = {
  paid:      { color: "#16854a", bg: "rgba(22,133,74,0.1)" },
  shipped:   { color: "#a8705c", bg: "rgba(201,144,122,0.12)" },
  delivered: { color: "#2563eb", bg: "rgba(37,99,235,0.08)" },
  cancelled: { color: "#c0392b", bg: "rgba(192,57,43,0.08)" },
};

// ─── Blank product form ───
const BLANK = {
  name: "", category: "Anklets", price: "", stock: "",
  description: "", material: "", purity: "", weight: "", occasion: "", details: "", image: "",
};

// ─── Add / Edit Product Form ───
function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm]       = useState(initial || BLANK);
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image || "");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      setError("Name, price and stock are required."); return;
    }
    setSaving(true); setError("");

    let imageUrl = form.image;

    // Upload image if new file selected
    if (imgFile) {
      const ext  = imgFile.name.split(".").pop().toLowerCase();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      // Convert to ArrayBuffer for reliable upload
      const arrayBuffer = await imgFile.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, uint8, {
          contentType: imgFile.type || "image/jpeg",
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadErr) {
        console.error("Upload error full:", uploadErr);
        setError(`Image upload failed: ${uploadErr.message} (status: ${uploadErr.statusCode})`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload = {
      name:        form.name.trim(),
      category:    form.category,
      price:       Number(form.price),
      stock:       Number(form.stock),
      description: form.description.trim(),
      material:    form.material.trim(),
      purity:      form.purity.trim(),
      weight:      form.weight.trim(),
      occasion:    form.occasion.trim(),
      details:     form.details.trim(),
      image:       imageUrl,
    };

    let err;
    if (initial?.id) {
      ({ error: err } = await supabase.from("products").update(payload).eq("id", initial.id));
    } else {
      ({ error: err } = await supabase.from("products").insert(payload));
    }

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSave();
  };

  return (
    <div style={{ background:"var(--white)", border:"1px solid rgba(0,0,0,0.08)", boxShadow:"0 8px 40px rgba(0,0,0,0.1)", marginBottom:24, overflow:"hidden" }}>
      {/* Form header */}
      <div style={{ background:"var(--forest)", padding:"18px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontFamily:"var(--font-display)", fontSize:22, color:"#fff", fontWeight:400 }}>
          {initial?.id ? "Edit Product" : "Add New Product"}
        </p>
        <button onClick={onCancel} style={{ background:"none", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.7)", padding:"6px 14px", fontSize:11, cursor:"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.1em" }}>
          Cancel
        </button>
      </div>

      <div style={{ padding:"28px 28px 32px", display:"grid", gridTemplateColumns:"200px 1fr", gap:32 }}>
        {/* Image upload */}
        <div>
          <div
            onClick={() => fileRef.current.click()}
            style={{ width:"100%", aspectRatio:"3/4", background:"var(--warm-white)", border:"2px dashed rgba(0,0,0,0.1)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative", transition:"border-color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.borderColor="var(--gold)"}
            onMouseOut={e  => e.currentTarget.style.borderColor="rgba(0,0,0,0.1)"}
          >
            {preview
              ? <img src={preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <>
                  <span style={{ fontSize:32, color:"var(--gold)", opacity:0.4 }}>◆</span>
                  <p style={{ fontSize:11, color:"var(--stone)", marginTop:8, letterSpacing:"0.08em", textAlign:"center", padding:"0 12px" }}>Click to upload image</p>
                </>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
          {preview && (
            <button onClick={() => { setPreview(""); setImgFile(null); set("image",""); }} style={{ width:"100%", marginTop:8, padding:"6px", fontSize:10, background:"transparent", border:"1px solid rgba(0,0,0,0.1)", color:"var(--stone)", cursor:"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.1em" }}>
              Remove Image
            </button>
          )}
          <p style={{ fontSize:10, color:"var(--stone)", marginTop:8, lineHeight:1.5, textAlign:"center" }}>
            Or paste URL below
          </p>
          <input
            placeholder="https://..."
            value={form.image}
            onChange={e => { set("image", e.target.value); setPreview(e.target.value); }}
            style={inputStyle}
          />
        </div>

        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Row 1 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input placeholder="e.g. Gold Anklet Chain" value={form.name} onChange={e => set("name",e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => set("category",e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input type="number" placeholder="e.g. 4500" value={form.price} onChange={e => set("price",e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity *</label>
              <input type="number" placeholder="e.g. 10" value={form.stock} onChange={e => set("stock",e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea placeholder="Short product description..." value={form.description} onChange={e => set("description",e.target.value)}
              style={{ ...inputStyle, height:72, resize:"vertical" }} />
          </div>

          {/* Jewellery specs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <div>
              <label style={labelStyle}>Material</label>
              <input placeholder="e.g. 22K Gold" value={form.material} onChange={e => set("material",e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Purity</label>
              <input placeholder="e.g. 916 Hallmark" value={form.purity} onChange={e => set("purity",e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Weight</label>
              <input placeholder="e.g. 5.2 grams" value={form.weight} onChange={e => set("weight",e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Occasion</label>
            <input placeholder="e.g. Wedding, Daily Wear, Festival" value={form.occasion} onChange={e => set("occasion",e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Additional Details</label>
            <textarea placeholder="Care instructions, size info, etc." value={form.details} onChange={e => set("details",e.target.value)}
              style={{ ...inputStyle, height:60, resize:"vertical" }} />
          </div>

          {error && <p style={{ fontSize:12, color:"#c0392b", padding:"8px 12px", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.15)" }}>{error}</p>}

          <button
            onClick={handleSave} disabled={saving}
            style={{ padding:"14px 32px", background:"var(--forest)", color:"#fff", border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:"var(--font-body)", fontSize:11, fontWeight:600, letterSpacing:"0.25em", textTransform:"uppercase", opacity:saving?0.6:1, alignSelf:"flex-start", transition:"all 0.3s" }}
            onMouseOver={e => !saving && (e.currentTarget.style.background = "var(--jade)")}
            onMouseOut={e  => !saving && (e.currentTarget.style.background = "var(--forest)")}
          >
            {saving ? "Saving…" : (initial?.id ? "Save Changes" : "Add Product")}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display:"block", fontSize:9, fontWeight:600, letterSpacing:"0.28em",
  textTransform:"uppercase", color:"var(--stone)", marginBottom:6,
};
const inputStyle = {
  width:"100%", padding:"10px 12px", background:"var(--off-white)",
  border:"1px solid rgba(0,0,0,0.1)", color:"var(--text-dark)",
  fontSize:13, fontFamily:"var(--font-body)", outline:"none",
  transition:"border-color 0.2s",
};

// ─── Main Admin Page ───
export default function Admin() {
  const [tab, setTab]         = useState("orders"); // "orders" | "products"
  const [orders, setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const { user } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    loadOrders();
    loadProducts();
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data || []).map(o => ({
      ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
    })));
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const filteredProducts = catFilter === "All" ? products : products.filter(p => p.category === catFilter);
  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const counts  = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  if (loading) return (
    <div className="orders-page">
      <div className="spinner-wrap" style={{ marginTop: 80 }}>
        <div className="spinner" /><p className="spinner-text">Loading admin panel</p>
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <p className="section-label">Admin Panel</p>
        <h1 className="section-title">Dashboard</h1>

        {/* Stats */}
        <div style={{ display:"flex", gap:12, marginTop:24, flexWrap:"wrap" }}>
          {[
            { label:"Total Orders",   value: orders.length },
            { label:"Total Revenue",  value:`₹ ${revenue.toLocaleString("en-IN")}` },
            { label:"Products",       value: products.length },
            { label:"Pending Ship",   value: counts.paid      || 0 },
            { label:"Delivered",      value: counts.delivered || 0 },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--white)", border:"1px solid rgba(0,0,0,0.07)", padding:"16px 22px", flex:1, minWidth:110, boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--stone)", marginBottom:6 }}>{s.label}</p>
              <p style={{ fontFamily:"var(--font-display)", fontSize:24, color:"var(--forest)" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:2, marginBottom:28, background:"rgba(0,0,0,0.04)", padding:4, width:"fit-content" }}>
        {[["orders","📦  Orders"], ["products","💎  Products"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:"10px 24px", fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase",
            fontFamily:"var(--font-body)", cursor:"pointer", border:"none", transition:"all 0.2s",
            background: tab === key ? "var(--forest)" : "transparent",
            color:      tab === key ? "#fff" : "var(--stone)",
          }}>{label}</button>
        ))}
      </div>

      {/* ─── ORDERS TAB ─── */}
      {tab === "orders" && (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
            {["all","paid","shipped","delivered","cancelled"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"8px 18px", fontSize:10, fontWeight:600, cursor:"pointer",
                letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"var(--font-body)",
                background: filter === f ? "var(--forest)" : "var(--white)",
                color:      filter === f ? "#fff" : "var(--stone)",
                border:     filter === f ? "1px solid var(--forest)" : "1px solid rgba(0,0,0,0.1)",
                transition:"all 0.2s",
              }}>{f} {f !== "all" && counts[f] ? `(${counts[f]})` : ""}</button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ textAlign:"center", padding:80, color:"var(--stone)", fontSize:13 }}>No {filter} orders yet.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(0,0,0,0.05)" }}>
              {filteredOrders.map(order => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.paid;
                return (
                  <div key={order.id} style={{ background:"var(--white)", padding:"24px 28px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:16, flexWrap:"wrap", gap:12 }}>
                      <div>
                        <p style={{ fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--stone)", marginBottom:3 }}>Order ID</p>
                        <p style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--text-dark)", marginBottom:3 }}>{order.order_id}</p>
                        <p style={{ fontSize:11, color:"var(--stone)" }}>
                          {new Date(order.created_at).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                          {order.razorpay_payment_id && <span> · {order.razorpay_payment_id}</span>}
                        </p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontFamily:"var(--font-display)", fontSize:26, color:"var(--gold-dark)" }}>₹ {Number(order.total).toLocaleString("en-IN")}</p>
                        <p style={{ fontSize:11, color:"var(--stone)" }}>Subtotal ₹{Number(order.subtotal).toLocaleString("en-IN")} + GST ₹{Number(order.gst).toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom:16 }}>
                      <p style={{ fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--stone)", marginBottom:8 }}>Items</p>
                      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display:"flex", justifyContent:"space-between", background:"var(--off-white)", padding:"9px 14px", fontSize:13, color:"var(--text-muted)" }}>
                            <span><strong style={{ color:"var(--text-dark)" }}>{item.name}</strong> × {item.quantity}</span>
                            <span style={{ color:"var(--gold-dark)" }}>₹ {(Number(item.price) * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    {order.shipping_address ? (
                      <div style={{ marginBottom:16, padding:"12px 16px", background:"var(--off-white)", borderLeft:"3px solid var(--gold)" }}>
                        <p style={{ fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--stone)", marginBottom:6 }}>Ship To</p>
                        <p style={{ fontSize:13, color:"var(--text-dark)", marginBottom:2 }}><strong>{order.shipping_name}</strong> · {order.shipping_phone}</p>
                        <p style={{ fontSize:12, color:"var(--text-muted)" }}>{order.shipping_address}</p>
                      </div>
                    ) : (
                      <div style={{ marginBottom:16, padding:"10px 14px", background:"rgba(192,57,43,0.05)", border:"1px solid rgba(192,57,43,0.12)", fontSize:12, color:"#c0392b" }}>
                        ⚠ No shipping address captured
                      </div>
                    )}

                    {/* Status controls */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ padding:"4px 12px", fontSize:10, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", background:sc.bg, color:sc.color }}>{order.status}</span>
                      <span style={{ fontSize:11, color:"var(--stone)" }}>→ Update:</span>
                      {["paid","shipped","delivered","cancelled"].filter(s => s !== order.status).map(s => (
                        <button key={s} onClick={() => updateStatus(order.id, s)} style={{
                          padding:"6px 14px", fontSize:10, fontWeight:600, cursor:"pointer",
                          letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"var(--font-body)",
                          background:"transparent", color:"var(--stone)", border:"1px solid rgba(0,0,0,0.1)", transition:"all 0.2s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.background="var(--forest)"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="var(--forest)"; }}
                        onMouseOut={e =>  { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--stone)"; e.currentTarget.style.borderColor="rgba(0,0,0,0.1)"; }}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── PRODUCTS TAB ─── */}
      {tab === "products" && (
        <>
          {/* Add product button */}
          {!showForm && !editProduct && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["All", ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)} style={{
                    padding:"7px 16px", fontSize:10, fontWeight:600, letterSpacing:"0.15em",
                    textTransform:"uppercase", fontFamily:"var(--font-body)", cursor:"pointer",
                    background: catFilter === cat ? "var(--forest)" : "var(--white)",
                    color:      catFilter === cat ? "#fff" : "var(--stone)",
                    border:     catFilter === cat ? "1px solid var(--forest)" : "1px solid rgba(0,0,0,0.1)",
                    transition:"all 0.2s",
                  }}>{cat}</button>
                ))}
              </div>
              <button
                onClick={() => setShowForm(true)}
                style={{ padding:"12px 28px", background:"var(--gold)", color:"#fff", border:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:11, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", transition:"all 0.3s" }}
                onMouseOver={e => e.currentTarget.style.background="var(--gold-lt)"}
                onMouseOut={e  => e.currentTarget.style.background="var(--gold)"}
              >
                + Add Product
              </button>
            </div>
          )}

          {/* Add form */}
          {showForm && (
            <ProductForm
              onSave={() => { setShowForm(false); loadProducts(); }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Edit form */}
          {editProduct && (
            <ProductForm
              initial={editProduct}
              onSave={() => { setEditProduct(null); loadProducts(); }}
              onCancel={() => setEditProduct(null)}
            />
          )}

          {/* Products list */}
          {!showForm && !editProduct && (
            filteredProducts.length === 0 ? (
              <div style={{ textAlign:"center", padding:80, color:"var(--stone)", fontSize:13 }}>
                No products {catFilter !== "All" ? `in ${catFilter}` : "yet"}. Click "+ Add Product" to get started.
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:1, background:"rgba(0,0,0,0.05)" }}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={{ background:"var(--white)", overflow:"hidden" }}>
                    {/* Product image */}
                    <div style={{ position:"relative", aspectRatio:"4/3", background:"var(--warm-white)", overflow:"hidden" }}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, color:"var(--gold)", opacity:0.3 }}>◆</div>
                      }
                      <span style={{ position:"absolute", top:10, left:10, background:"var(--forest)", color:"#fff", padding:"3px 10px", fontSize:9, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase" }}>{p.category}</span>
                    </div>
                    {/* Product info */}
                    <div style={{ padding:"16px 18px 18px" }}>
                      <p style={{ fontFamily:"var(--font-display)", fontSize:17, color:"var(--text-dark)", marginBottom:4 }}>{p.name}</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <p style={{ fontSize:14, color:"var(--gold-dark)", fontWeight:400 }}>₹ {Number(p.price).toLocaleString("en-IN")}</p>
                        <p style={{ fontSize:11, color: p.stock > 0 ? "#16854a" : "#c0392b" }}>{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</p>
                      </div>
                      {p.material && <p style={{ fontSize:11, color:"var(--stone)", marginBottom:12 }}>{p.material}{p.purity ? ` · ${p.purity}` : ""}{p.weight ? ` · ${p.weight}` : ""}</p>}
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          onClick={() => setEditProduct(p)}
                          style={{ flex:1, padding:"8px", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"var(--font-body)", cursor:"pointer", background:"var(--forest)", color:"#fff", border:"none", transition:"all 0.2s" }}
                          onMouseOver={e => e.currentTarget.style.background="var(--jade)"}
                          onMouseOut={e  => e.currentTarget.style.background="var(--forest)"}
                        >Edit</button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deleting === p.id}
                          style={{ flex:1, padding:"8px", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"var(--font-body)", cursor:deleting===p.id?"not-allowed":"pointer", background:"transparent", color:"#c0392b", border:"1px solid rgba(192,57,43,0.2)", transition:"all 0.2s", opacity:deleting===p.id?0.5:1 }}
                          onMouseOver={e => deleting!==p.id && (e.currentTarget.style.background="rgba(192,57,43,0.06)")}
                          onMouseOut={e  => e.currentTarget.style.background="transparent"}
                        >{deleting === p.id ? "…" : "Delete"}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}