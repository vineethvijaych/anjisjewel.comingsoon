import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';   // ← Added

const ADMIN_EMAILS = [
  "vineethcpz6881@gmail.com",
  "anjisadmin@gmail.com"
];

const CATEGORIES = [
  "Anklets",
  "Earrings",
  "Necklace",
  "Bracelets",
  "Bangles",
  "Minji",
  "Hip Chain",
  "Hair Accessories",
  "Finger Ring"
];

const STATUS_COLORS = {
  paid:      { color: "#10b981", bg: "#ecfdf5", border: "#10b981" },
  shipped:   { color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b" },
  delivered: { color: "#3b82f6", bg: "#eff6ff", border: "#3b82f6" },
  cancelled: { color: "#ef4444", bg: "#fef2f2", border: "#ef4444" },
};

// ─── Blank product form ───
const BLANK = {
  name: "", category: "Anklets", price: "", stock: "",
  description: "", material: "", purity: "", weight: "", occasion: "", details: "", image: "",
};

// ─── Reusable Input Styles ───
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
  letterSpacing: "0.5px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  transition: "all 0.2s",
};

const inputFocusStyle = {
  borderColor: "#10b981",
  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
};

// ─── Add / Edit Product Form ───
function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK);
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      setError("Name, price and stock are required.");
      return;
    }
    setSaving(true);
    setError("");

    let imageUrl = form.image;

    if (imgFile) {
      const ext = imgFile.name.split(".").pop().toLowerCase();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const arrayBuffer = await imgFile.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, uint8, {
          contentType: imgFile.type || "image/jpeg",
          upsert: true,
        });

      if (uploadErr) {
        setError(`Image upload failed: ${uploadErr.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description.trim(),
      material: form.material.trim(),
      purity: form.purity.trim(),
      weight: form.weight.trim(),
      occasion: form.occasion.trim(),
      details: form.details.trim(),
      image: imageUrl,
    };

    let err;
    if (initial?.id) {
      ({ error: err } = await supabase.from("products").update(payload).eq("id", initial.id));
    } else {
      ({ error: err } = await supabase.from("products").insert(payload));
    }

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSave();
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      marginBottom: "32px",
      overflow: "hidden",
    }}>
      {/* Form Header */}
      <div style={{
        background: "#111827",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h2 style={{ 
          fontSize: "22px", 
          color: "#ffffff", 
          fontWeight: "600",
          margin: 0 
        }}>
          {initial?.id ? "Edit Product" : "Add New Product"}
        </h2>
        <button 
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#e5e7eb",
            padding: "8px 20px",
            fontSize: "13px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{ padding: "40px 32px", display: "grid", gridTemplateColumns: "240px 1fr", gap: "48px" }}>
        {/* Image Upload */}
        <div>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width: "100%",
              aspectRatio: "3/4",
              background: "#f9fafb",
              border: "2px dashed #d1d5db",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              transition: "all 0.2s",
            }}
          >
            {preview ? (
              <img 
                src={preview} 
                alt="" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <>
                <div style={{ fontSize: "48px", color: "#9ca3af", marginBottom: "8px" }}>📸</div>
                <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center" }}>
                  Click to upload image
                </p>
              </>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

          {preview && (
            <button 
              onClick={() => { setPreview(""); setImgFile(null); set("image", ""); }}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "10px",
                background: "#fee2e2",
                color: "#ef4444",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Remove Image
            </button>
          )}

          <p style={{ fontSize: "13px", color: "#6b7280", margin: "16px 0 8px", textAlign: "center" }}>
            Or paste image URL
          </p>
          <input
            placeholder="https://..."
            value={form.image}
            onChange={e => { set("image", e.target.value); setPreview(e.target.value); }}
            style={inputStyle}
          />
        </div>

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* ... (All form fields remain the same) ... */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input 
                placeholder="e.g. Gold Anklet Chain" 
                value={form.name} 
                onChange={e => set("name", e.target.value)} 
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select 
                value={form.category} 
                onChange={e => set("category", e.target.value)} 
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input 
                type="number" 
                placeholder="4500" 
                value={form.price} 
                onChange={e => set("price", e.target.value)} 
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity *</label>
              <input 
                type="number" 
                placeholder="10" 
                value={form.stock} 
                onChange={e => set("stock", e.target.value)} 
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea 
              placeholder="Short product description..." 
              value={form.description} 
              onChange={e => set("description", e.target.value)}
              style={{ ...inputStyle, height: "88px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Material</label>
              <input placeholder="22K Gold" value={form.material} onChange={e => set("material", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Purity</label>
              <input placeholder="916 Hallmark" value={form.purity} onChange={e => set("purity", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Weight</label>
              <input placeholder="5.2 grams" value={form.weight} onChange={e => set("weight", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Occasion</label>
            <input 
              placeholder="Wedding, Daily Wear, Festival" 
              value={form.occasion} 
              onChange={e => set("occasion", e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={labelStyle}>Additional Details</label>
            <textarea 
              placeholder="Care instructions, size info, etc." 
              value={form.details} 
              onChange={e => set("details", e.target.value)}
              style={{ ...inputStyle, height: "72px", resize: "vertical" }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: "12px 16px", 
              background: "#fef2f2", 
              border: "1px solid #fecaca", 
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "14px 32px",
              background: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              alignSelf: "flex-start",
              marginTop: "8px",
            }}
          >
            {saving ? "Saving..." : (initial?.id ? "Save Changes" : "Add Product")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───
export default function Admin() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [catFilter, setCatFilter] = useState("All");

  const { user } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!ADMIN_EMAILS.includes(user.email)) {
  navigate("/");
  return;
}
    loadOrders();
    loadProducts();
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data || []).map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
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

  // ==================== EXPORT TO EXCEL ====================
  const exportOrdersToExcel = () => {
    const dataToExport = filter === "all" ? orders : orders.filter(o => o.status === filter);

    if (dataToExport.length === 0) {
      alert("No orders to export!");
      return;
    }

    const exportData = [];

    dataToExport.forEach(order => {
      const baseRow = {
        "Order ID": order.order_id,
        "Date": new Date(order.created_at).toLocaleString("en-IN"),
        "Customer Name": order.shipping_name || "N/A",
        "Phone": order.shipping_phone || "N/A",
        "Address": order.shipping_address || "N/A",
        "Status": order.status.toUpperCase(),
        "Subtotal (₹)": Number(order.subtotal || 0),
        "GST (₹)": Number(order.gst || 0),
        "Total (₹)": Number(order.total || 0),
      };

      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          exportData.push({
            ...baseRow,
            "Item #": index + 1,
            "Product Name": item.name,
            "Quantity": item.quantity,
            "Price per Unit (₹)": Number(item.price),
            "Item Total (₹)": Number(item.price) * item.quantity,
          });
        });
      } else {
        exportData.push({
          ...baseRow,
          "Item #": "",
          "Product Name": "No items",
          "Quantity": "",
          "Price per Unit (₹)": "",
          "Item Total (₹)": "",
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto column width
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 15 },
      { wch: 45 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 8 }, { wch: 35 }, { wch: 10 },
      { wch: 18 }, { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, `Orders_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  // =========================================================

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const filteredProducts = catFilter === "All" ? products : products.filter(p => p.category === catFilter);
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const counts = orders.reduce((acc, o) => { 
    acc[o.status] = (acc[o.status] || 0) + 1; 
    return acc; 
  }, {});

  if (loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1400px", margin: "0 auto", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500", marginBottom: "4px" }}>ADMIN PANEL</p>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginTop: "32px" }}>
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Total Revenue", value: `₹ ${revenue.toLocaleString("en-IN")}` },
            { label: "Total Products", value: products.length },
            { label: "Pending Shipment", value: counts.paid || 0 },
            { label: "Delivered", value: counts.delivered || 0 },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ 
        display: "inline-flex", 
        background: "#f3f4f6", 
        borderRadius: "10px", 
        padding: "6px", 
        marginBottom: "32px" 
      }}>
        {[
          { key: "orders", label: "📦 Orders" },
          { key: "products", label: "💎 Products" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              background: tab === key ? "#111827" : "transparent",
              color: tab === key ? "#ffffff" : "#4b5563",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ==================== ORDERS TAB ==================== */}
      {tab === "orders" && (
        <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            {["all", "paid", "shipped", "delivered", "cancelled"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: filter === f ? "#111827" : "#ffffff",
                  color: filter === f ? "#ffffff" : "#374151",
                  border: filter === f ? "none" : "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} {f !== "all" && counts[f] ? `(${counts[f]})` : ""}
              </button>
            ))}

            {/* Export Button */}
            <button
              onClick={exportOrdersToExcel}
              style={{
                marginLeft: "auto",
                padding: "11px 26px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                background: "#10b981",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📊 Export to Excel
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 20px", color: "#6b7280", fontSize: "16px" }}>
              No {filter} orders yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredOrders.map(order => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.paid;
                return (
                  <div key={order.id} style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    padding: "28px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>
                    {/* Order Header, Items, Shipping, Status - Same as before */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>ORDER ID</p>
                        <p style={{ fontSize: "20px", fontWeight: "600", color: "#111827" }}>{order.order_id}</p>
                        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px" }}>
                          {new Date(order.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
                          ₹ {Number(order.total).toLocaleString("en-IN")}
                        </p>
                        <p style={{ fontSize: "14px", color: "#6b7280" }}>
                          Subtotal ₹{Number(order.subtotal).toLocaleString("en-IN")} + GST ₹{Number(order.gst).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: "24px" }}>
                      <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", marginBottom: "12px" }}>ITEMS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "#f9fafb",
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}>
                            <span><strong>{item.name}</strong> × {item.quantity}</span>
                            <span style={{ fontWeight: "600" }}>₹ {(Number(item.price) * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {order.shipping_address ? (
                      <div style={{
                        padding: "20px",
                        background: "#f9fafb",
                        borderRadius: "10px",
                        borderLeft: "4px solid #10b981",
                        marginBottom: "24px",
                      }}>
                        <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", marginBottom: "10px" }}>SHIPPING TO</p>
                        <p style={{ fontWeight: "600" }}>{order.shipping_name} • {order.shipping_phone}</p>
                        <p style={{ color: "#4b5563", marginTop: "6px" }}>{order.shipping_address}</p>
                      </div>
                    ) : (
                      <div style={{ color: "#ef4444", background: "#fef2f2", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                        ⚠ No shipping address available
                      </div>
                    )}

                    {/* Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "6px 18px",
                        borderRadius: "9999px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}>
                        {order.status.toUpperCase()}
                      </span>

                      <span style={{ color: "#6b7280", fontSize: "14px" }}>Update status →</span>

                      {["paid", "shipped", "delivered", "cancelled"]
                        .filter(s => s !== order.status)
                        .map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            style={{
                              padding: "8px 18px",
                              borderRadius: "8px",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              fontSize: "13px",
                              fontWeight: "500",
                              cursor: "pointer",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PRODUCTS TAB - Unchanged */}
      {tab === "products" && (
        <>
          {!showForm && !editProduct && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["All", ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatFilter(cat)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: catFilter === cat ? "#111827" : "#ffffff",
                      color: catFilter === cat ? "#ffffff" : "#374151",
                      border: catFilter === cat ? "none" : "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "14px 28px",
                  background: "#111827",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                + Add New Product
              </button>
            </div>
          )}

          {showForm && <ProductForm onSave={() => { setShowForm(false); loadProducts(); }} onCancel={() => setShowForm(false)} />}
          {editProduct && <ProductForm initial={editProduct} onSave={() => { setEditProduct(null); loadProducts(); }} onCancel={() => setEditProduct(null)} />}

          {!showForm && !editProduct && (
            filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "120px 20px", color: "#6b7280", fontSize: "16px" }}>
                No products found. Add your first product above.
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "24px" 
              }}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ position: "relative", aspectRatio: "4/3", background: "#f9fafb" }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "60px", color: "#e5e7eb" }}>◆</div>
                      )}
                      <span style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#111827",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {p.category}
                      </span>
                    </div>

                    <div style={{ padding: "20px" }}>
                      <p style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>{p.name}</p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <p style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>₹ {Number(p.price).toLocaleString("en-IN")}</p>
                        <p style={{ 
                          fontSize: "14px", 
                          color: p.stock > 0 ? "#10b981" : "#ef4444",
                          fontWeight: "500" 
                        }}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </p>
                      </div>

                      {p.material && (
                        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
                          {p.material}{p.purity ? ` • ${p.purity}` : ""}{p.weight ? ` • ${p.weight}` : ""}
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => setEditProduct(p)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "#111827",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deleting === p.id}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "transparent",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: deleting === p.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {deleting === p.id ? "..." : "Delete"}
                        </button>
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