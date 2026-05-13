import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const ADMIN_EMAILS = [
  "vineethcpz6881@gmail.com",
  "anjisadmin@gmail.com"
];

const DEFAULT_CATEGORIES = [
  { name: "Anklets", icon: "✦", description: "Delicate chains for graceful ankles", sort_order: 1, is_active: true },
  { name: "Earrings", icon: "◈", description: "From studs to chandelier drops", sort_order: 2, is_active: true },
  { name: "Necklace", icon: "◆", description: "Timeless pendants & layered pieces", sort_order: 3, is_active: true },
  { name: "Bracelets", icon: "◉", description: "Stacked or solo, for every wrist", sort_order: 4, is_active: true },
  { name: "Bangles", icon: "○", description: "Traditional & contemporary bangles", sort_order: 5, is_active: true },
  { name: "Minji", icon: "✿", description: "Exclusive signature collection", sort_order: 6, is_active: true },
  { name: "Hip Chain", icon: "❖", description: "Elegant waist chains with modern charm", sort_order: 7, is_active: true },
  { name: "Hair Accessories", icon: "❀", description: "Stylish pieces to complete your hairstyle", sort_order: 8, is_active: true },
  { name: "Finger Ring", icon: "◍", description: "Minimal to statement rings for every style", sort_order: 9, is_active: true },
];

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#111827",
};

// ====================== PRODUCT FORM ======================
function ProductForm({ initial, onSave, onCancel, categories = [] }) {
  const [form, setForm] = useState(initial || {
    name: "", category: "Anklets", price: "", stock: "",
    description: "", material: "", purity: "", weight: "", occasion: "", details: "", image: ""
  });

  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = categories.length ? categories.map(c => c.name) : DEFAULT_CATEGORIES.map(c => c.name);

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
      try {
        const ext = imgFile.name.split(".").pop().toLowerCase();
        const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imgFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = publicUrl;
      } catch (err) {
        setError("Image upload failed. Please try again.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image: imageUrl,
    };

    if (initial?.id) {
      await supabase.from("products").update(payload).eq("id", initial.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    onSave();
    setSaving(false);
  };

  return (
    <div style={{ background: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
      <h2 style={{ marginBottom: "24px" }}>{initial?.id ? "Edit Product" : "Add New Product"}</h2>

      {error && <div style={{ color: "#ef4444", padding: "12px", background: "#fef2f2", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Product Image</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {preview && <img src={preview} alt="preview" style={{ width: "220px", marginTop: "12px", borderRadius: "10px" }} />}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => set("price", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Stock Quantity *</label>
            <input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, height: "90px" }} />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: "14px 32px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
            {saving ? "Saving..." : initial?.id ? "Save Changes" : "Add Product"}
          </button>
          <button onClick={onCancel} style={{ padding: "14px 32px", background: "#f3f4f6", border: "none", borderRadius: "8px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ====================== MAIN ADMIN COMPONENT ======================
export default function Admin() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [categoryDraft, setCategoryDraft] = useState({ name: "", icon: "◆", description: "", image: "", sort_order: "" });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const { user } = useCart();
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data || []).map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items || [],
    })));
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }, []);

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (error) {
      setCategoryError("Using default categories");
      setCategories(DEFAULT_CATEGORIES);
    } else {
      setCategories(data?.length ? data : DEFAULT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      navigate("/");
      return;
    }
    loadOrders();
    loadProducts();
    loadCategories();
    setLoading(false);
  }, [user, navigate]);

  const exportOrdersToExcel = () => {
    const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
    if (filtered.length === 0) return alert("No orders to export!");

    const exportData = [];
    filtered.forEach(order => {
      if (order.items?.length > 0) {
        order.items.forEach(item => {
          exportData.push({
            "Order ID": order.order_id,
            "Date": new Date(order.created_at).toLocaleString("en-IN"),
            "Customer Name": order.shipping_name || "N/A",
            "Phone": order.shipping_phone || "N/A",
            "Status": order.status?.toUpperCase(),
            "Product Name": item.name,
            "Quantity": item.quantity,
            "Price (₹)": item.price,
            "Item Total (₹)": item.quantity * item.price,
            "Order Total (₹)": order.total,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    loadProducts();
    setDeleting(null);
  };

  const saveCategory = async () => {
    if (!categoryDraft.name.trim()) return setCategoryError("Category name is required");
    setCategorySaving(true);

    const payload = {
      name: categoryDraft.name.trim(),
      icon: categoryDraft.icon.trim() || "◆",
      description: categoryDraft.description.trim(),
      image: categoryDraft.image.trim(),
      sort_order: Number(categoryDraft.sort_order) || categories.length + 1,
      is_active: true,
    };

    const { error } = await supabase.from("categories").insert(payload);
    if (error) setCategoryError(error.message);
    else {
      setCategoryDraft({ name: "", icon: "◆", description: "", image: "", sort_order: "" });
      loadCategories();
    }
    setCategorySaving(false);
  };

  const updateCategory = async (category, patch) => {
    const updated = { ...category, ...patch };
    setCategories(prev => prev.map(c => (c.id || c.name) === (category.id || category.name) ? updated : c));

    if (category.id) {
      await supabase.from("categories").update(patch).eq("id", category.id);
    }
  };

  const deleteCategory = async (category) => {
    const hasProducts = products.some(p => p.category === category.name);
    if (hasProducts) return alert("Cannot delete. Some products are using this category.");

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    if (category.id) {
      await supabase.from("categories").delete().eq("id", category.id);
    } else {
      setCategories(prev => prev.filter(c => c.name !== category.name));
    }
    loadCategories();
  };

  const filteredProducts = catFilter === "All" ? products : products.filter(p => p.category === catFilter);
  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1400px", margin: "0 auto", background: "#f9fafb", minHeight: "100vh" }}>
      <p style={{ color: "#6b7280", fontWeight: "500" }}>ADMIN PANEL</p>
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "30px" }}>Dashboard</h1>

      {/* Tabs */}
      <div style={{ display: "inline-flex", background: "#f3f4f6", padding: "6px", borderRadius: "10px", marginBottom: "30px" }}>
        {["orders", "products", "categories"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontWeight: "600",
              border: "none",
              background: tab === t ? "#111827" : "transparent",
              color: tab === t ? "#fff" : "#4b5563",
            }}
          >
            {t === "orders" ? "📦 Orders" : t === "products" ? "💎 Products" : "🏷️ Categories"}
          </button>
        ))}
      </div>

      {/* ==================== ORDERS TAB ==================== */}
      {tab === "orders" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "paid", "shipped", "delivered", "cancelled"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: filter === s ? "#111827" : "#fff",
                    color: filter === s ? "#fff" : "#374151",
                    border: filter === s ? "none" : "1px solid #e5e7eb",
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={exportOrdersToExcel} style={{ padding: "10px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
              Export to Excel
            </button>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "16px", textAlign: "left" }}>Order ID</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Customer</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Total</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "16px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "16px" }}>{order.order_id}</td>
                    <td style={{ padding: "16px" }}>{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "16px" }}>{order.shipping_name}</td>
                    <td style={{ padding: "16px" }}>₹{order.total}</td>
                    <td style={{ padding: "16px" }}>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px" }}>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: "16px" }}>View Details</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== PRODUCTS TAB ==================== */}
      {tab === "products" && (
        <>
          {!showForm && !editProduct && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["All", ...categories.map(c => c.name)].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatFilter(cat)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      background: catFilter === cat ? "#111827" : "#fff",
                      color: catFilter === cat ? "#fff" : "#374151",
                      border: catFilter === cat ? "none" : "1px solid #e5e7eb",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowForm(true)} style={{ padding: "14px 28px", background: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
                + Add New Product
              </button>
            </div>
          )}

          {(showForm || editProduct) && (
            <ProductForm
              initial={editProduct}
              categories={categories}
              onSave={() => { setShowForm(false); setEditProduct(null); loadProducts(); }}
              onCancel={() => { setShowForm(false); setEditProduct(null); }}
            />
          )}

          {!showForm && !editProduct && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {p.image && <img src={p.image} alt={p.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />}
                  <div style={{ padding: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>{p.name}</h4>
                    <p style={{ margin: "0 0 12px 0", color: "#10b981", fontWeight: "600" }}>₹{p.price}</p>
                    <p>Stock: {p.stock}</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                      <button onClick={() => setEditProduct(p)} style={{ flex: 1, padding: "10px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px" }}>Edit</button>
                      <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} style={{ flex: 1, padding: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px" }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== CATEGORIES TAB ==================== */}
      {tab === "categories" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }}>
          {/* Add Category */}
          <div style={{ background: "#fff", padding: "28px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <h2>Add New Category</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input value={categoryDraft.name} onChange={e => setCategoryDraft({ ...categoryDraft, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <input value={categoryDraft.icon} onChange={e => setCategoryDraft({ ...categoryDraft, icon: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" value={categoryDraft.sort_order} onChange={e => setCategoryDraft({ ...categoryDraft, sort_order: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={categoryDraft.description} onChange={e => setCategoryDraft({ ...categoryDraft, description: e.target.value })} style={{ ...inputStyle, height: "80px" }} />
              </div>
              <div>
                <label style={labelStyle}>Image URL (Optional)</label>
                <input value={categoryDraft.image} onChange={e => setCategoryDraft({ ...categoryDraft, image: e.target.value })} style={inputStyle} />
              </div>

              {categoryError && <div style={{ color: "red" }}>{categoryError}</div>}

              <button onClick={saveCategory} disabled={categorySaving} style={{ padding: "14px", background: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600" }}>
                {categorySaving ? "Saving..." : "+ Add Category"}
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <div style={{ padding: "20px 24px", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
              All Categories ({categories.length})
            </div>
            {categories.map((cat, index) => (
              <div key={cat.id || index} style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 110px 100px", gap: "12px", padding: "16px 24px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                <input value={cat.icon || ""} onChange={e => updateCategory(cat, { icon: e.target.value })} style={{ ...inputStyle, fontSize: "24px", textAlign: "center" }} />
                <div>
                  <input value={cat.name} onChange={e => updateCategory(cat, { name: e.target.value })} style={{ ...inputStyle, fontWeight: "700" }} />
                  <input value={cat.description || ""} onChange={e => updateCategory(cat, { description: e.target.value })} placeholder="Description" style={{ ...inputStyle, fontSize: "13px", marginTop: "6px" }} />
                </div>
                <input type="number" value={cat.sort_order} onChange={e => updateCategory(cat, { sort_order: Number(e.target.value) })} style={inputStyle} />
                <button onClick={() => updateCategory(cat, { is_active: !cat.is_active })} style={{ padding: "8px", borderRadius: "6px", background: cat.is_active ? "#dcfce7" : "#fee2e2", color: cat.is_active ? "#166534" : "#991b1b", border: "none" }}>
                  {cat.is_active ? "Active" : "Hidden"}
                </button>
                <button onClick={() => deleteCategory(cat)} style={{ padding: "8px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px" }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}