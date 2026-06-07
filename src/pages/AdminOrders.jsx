import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
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

// ====================== HELPER DATE FORMATTING ======================
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const timeStr = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  if (diffMins < 1) return `Just now`;
  if (diffMins < 60) return `${diffMins}m ago (${timeStr})`;
  if (diffHours < 24) {
    if (date.getDate() === now.getDate()) {
      return `Today, ${timeStr}`;
    }
    return `Yesterday, ${timeStr}`;
  }
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${diffDays}d ago (${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })})`;
  
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) + ", " + timeStr;
};

// ====================== PRODUCT FORM ======================
function ProductForm({ initial, onSave, onCancel, categories = [], showToast }) {
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
        const formData = new FormData();
        formData.append("image", imgFile);

        const response = await fetch(
          "https://anjisjewel.com/api/upload.php",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        imageUrl = result.url;
      } catch (err) {
        console.error(err);
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
      showToast("Product updated successfully!", "success");
    } else {
      await supabase.from("products").insert(payload);
      showToast("Product added successfully!", "success");
    }

    onSave();
    setSaving(false);
  };

  return (
    <div className="form-card" style={{ marginBottom: "30px" }}>
      <h2 className="form-title">{initial?.id ? "Edit Product" : "Add New Product"}</h2>

      {error && (
        <div style={{ 
          color: "#ef4444", 
          padding: "12px 16px", 
          background: "#fef2f2", 
          border: "1px solid #fca5a5",
          borderRadius: "8px", 
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label className="form-label">Product Image</label>
          <label className="file-upload-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#64748b" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>Click to select product image</span>
            <input type="file" accept="image/*" onChange={handleFile} className="file-upload-input" />
            {preview && <img src={preview} alt="preview" className="file-upload-preview" />}
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="form-input">
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Quantity *</label>
            <input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} className="form-textarea" style={{ height: "90px" }} />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button onClick={handleSave} disabled={saving} className="btn-success">
            {saving ? "Saving..." : initial?.id ? "Save Changes" : "Add Product"}
          </button>
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ====================== MAIN ADMIN COMPONENT ======================
export default function Admin() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  
  // Filters and sorting
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSortBy, setOrderSortBy] = useState("date-desc");
  const [catFilter, setCatFilter] = useState("All");
  const [productSortBy, setProductSortBy] = useState("newest");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Category draft state
  const [categoryDraft, setCategoryDraft] = useState({ name: "", icon: "◆", description: "", image: "", sort_order: "" });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Theme state (check localStorage)
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "light");

  const navigate = useNavigate();

  // Toast dispatcher
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
    showToast(`Switched to ${nextTheme} mode`, "success");
  };

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
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;

        if (!currentUser) {
          navigate("/");
          return;
        }

        if (!ADMIN_EMAILS.includes(currentUser.email)) {
          navigate("/");
          return;
        }

        await Promise.all([
          loadOrders(),
          loadProducts(),
          loadCategories(),
        ]);

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Admin auth error:", error);
        navigate("/");
      }
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
        navigate("/");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadOrders, loadProducts, loadCategories]);

  const exportOrdersToExcel = () => {
    const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

    if (filtered.length === 0) {
      return showToast("No orders to export!", "error");
    }

    const exportData = [];

    filtered.forEach(order => {
      if (order.items?.length > 0) {
        order.items.forEach(item => {
          exportData.push({
            "Order ID": order.order_id,
            "Date": new Date(order.created_at).toLocaleString("en-IN"),
            "Customer Name": order.shipping_name || "N/A",
            "Phone": order.shipping_phone || "N/A",
            "Address": order.shipping_address || "N/A",
            "City": order.shipping_city || "N/A",
            "State": order.shipping_state || "N/A",
            "Pincode": order.shipping_pincode || "N/A",
            "Country": order.shipping_country || "India",
            "Full Shipping Address": [
              order.shipping_address,
              order.shipping_city,
              order.shipping_state,
              order.shipping_pincode,
              order.shipping_country,
            ]
              .filter(Boolean)
              .join(", "),
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

    XLSX.writeFile(
      wb,
      `Orders_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast("Orders exported successfully!", "success");
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(`Order status updated to ${status.toUpperCase()}!`, "success");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await loadProducts();
      showToast("Product deleted successfully!", "success");
    } catch (e) {
      console.log(e);
      showToast(e.message, "error");
    }
    setDeleting(null);
  };

  const quickRestock = async (productId, currentStock, amount) => {
    const newStock = Number(currentStock) + amount;
    // optimistic UI
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    try {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
      if (error) throw error;
      showToast(`Quick restock: +${amount} items added!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Quick restock failed. Please reload.", "error");
      loadProducts();
    }
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
    if (error) {
      setCategoryError(error.message);
      showToast(error.message, "error");
    } else {
      setCategoryDraft({ name: "", icon: "◆", description: "", image: "", sort_order: "" });
      loadCategories();
      showToast("Category added successfully!", "success");
    }
    setCategorySaving(false);
  };

  const updateCategory = async (category, patch) => {
    const updated = { ...category, ...patch };
    setCategories(prev => prev.map(c => (c.id || c.name) === (category.id || category.name) ? updated : c));

    if (category.id) {
      await supabase.from("categories").update(patch).eq("id", category.id);
    }
    showToast("Category updated!", "success");
  };

  const deleteCategory = async (category) => {
    const hasProducts = products.some(p => p.category === category.name);
    if (hasProducts) return showToast("Cannot delete. Some products are using this category.", "error");

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    if (category.id) {
      await supabase.from("categories").delete().eq("id", category.id);
    } else {
      setCategories(prev => prev.filter(c => c.name !== category.name));
    }
    loadCategories();
    showToast("Category deleted successfully!", "success");
  };

  // Date Filtering logic
  const filterOrdersByDate = (orderList) => {
    if (dateFilter === "all") return orderList;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return orderList.filter(o => {
      const orderDate = new Date(o.created_at);
      if (dateFilter === "today") {
        return orderDate >= today;
      } else if (dateFilter === "yesterday") {
        return orderDate >= yesterday && orderDate < today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      return true;
    });
  };

  // SVG Chart data formatting
  const getSalesData = () => {
    const salesMap = {};
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      dates.push(dateStr);
      salesMap[dateStr] = 0;
    }
    
    orders.forEach(o => {
      if (o.status !== "cancelled") {
        const dateStr = new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        if (salesMap[dateStr] !== undefined) {
          salesMap[dateStr] += Number(o.total || 0);
        }
      }
    });

    const dataPoints = dates.map(date => salesMap[date]);
    return { dates, dataPoints };
  };

  const salesInfo = getSalesData();
  const maxSalesVal = Math.max(...salesInfo.dataPoints, 1000);
  const midSalesVal = Math.round(maxSalesVal / 2);

  // SVG chart path math
  const chartWidth = 550;
  const chartHeight = 130;
  const paddingX = 35;
  const paddingY = 15;
  const drawWidth = chartWidth - paddingX * 2;
  const drawHeight = chartHeight - paddingY * 2;

  const points = salesInfo.dataPoints.map((val, index) => {
    const x = paddingX + (index / 6) * drawWidth;
    const y = paddingY + drawHeight - (val / maxSalesVal) * drawHeight;
    return { x, y, val, date: salesInfo.dates[index] };
  });

  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length-1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` 
    : "";

  // Calculated items
  const lowStockProducts = products.filter(p => Number(p.stock) <= 5);

  const dateFilteredOrders = filterOrdersByDate(orders);
  
  const filteredOrders = dateFilteredOrders.filter(order => {
    const statusMatch = filter === "all" || order.status === filter;
    const searchMatch = !orderSearch || 
      order.order_id?.toString().toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.shipping_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.shipping_phone?.toLowerCase().includes(orderSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (orderSortBy === "date-desc") return new Date(b.created_at) - new Date(a.created_at);
    if (orderSortBy === "date-asc") return new Date(a.created_at) - new Date(b.created_at);
    if (orderSortBy === "total-desc") return Number(b.total) - Number(a.total);
    if (orderSortBy === "total-asc") return Number(a.total) - Number(b.total);
    return 0;
  });

  const productFilterSet = catFilter === "All" ? products : products.filter(p => p.category === catFilter);
  const productAlertFiltered = showLowStockOnly ? productFilterSet.filter(p => Number(p.stock) <= 5) : productFilterSet;

  // Sort products
  const displayProducts = [...productAlertFiltered].sort((a, b) => {
    if (productSortBy === "newest") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (productSortBy === "price-asc") return Number(a.price) - Number(b.price);
    if (productSortBy === "price-desc") return Number(b.price) - Number(a.price);
    if (productSortBy === "stock-asc") return Number(a.stock) - Number(b.stock);
    return 0;
  });

  // Additional Metrics
  const activeOrdersCount = orders.filter(o => o.status !== "cancelled").length;
  const totalRevenueVal = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrderValue = activeOrdersCount > 0 ? Math.round(totalRevenueVal / activeOrdersCount) : 0;

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        background: "#0f172a", 
        color: "#fff",
        fontFamily: "'Outfit', sans-serif" 
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "#fbbf24",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px"
        }} />
        <p style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "0.5px" }}>Loading Admin Panel...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`admin-panel theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        /* Theme Config */
        .admin-panel.theme-light {
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --table-header: #f8fafc;
          --input-bg: #ffffff;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --chart-grid: #e2e8f0;
        }

        .admin-panel.theme-dark {
          --bg-main: #0b0f19;
          --bg-card: #151b2c;
          --border: #222d44;
          --text-main: #f3f4f6;
          --text-muted: #94a3b8;
          --table-header: #1d2538;
          --input-bg: #1e293b;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
          --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          --chart-grid: #222d44;
        }

        .admin-panel {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--text-main);
          background-color: var(--bg-main);
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          transition: background-color 0.3s, color 0.3s;
        }

        .admin-panel * {
          box-sizing: border-box;
          transition: background-color 0.2s ease-out, border-color 0.2s ease-out;
        }

        /* Toast Container */
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10010;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
          width: calc(100% - 48px);
          pointer-events: none;
        }

        .toast-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: auto;
        }

        .toast-success {
          background: linear-gradient(135deg, #10b981, #059669);
          border-left: 5px solid #047857;
        }

        .toast-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-left: 5px solid #b91c1c;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: var(--bg-main);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        /* Sidebar Styling */
        .admin-sidebar {
          width: 260px;
          background-color: #0f172a;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #1e293b;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 24px 16px;
        }

        .sidebar-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          padding-left: 8px;
        }

        .sidebar-logo span {
          color: #fbbf24;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .sidebar-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .sidebar-btn:hover {
          background-color: #1e293b;
          color: #fff;
        }

        .sidebar-btn.active {
          background-color: #fbbf24;
          color: #0f172a;
          font-weight: 600;
        }

        .sidebar-footer {
          border-top: 1px solid #1e293b;
          padding-top: 16px;
          font-size: 12px;
          color: #64748b;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-left: 8px;
        }

        .sidebar-user {
          font-weight: 500;
          color: #94a3b8;
          word-break: break-all;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #334155;
          background-color: #1e293b;
          color: #fbbf24;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
          background-color: #334155;
          color: #fff;
        }

        /* Main Content Wrapper */
        .admin-main-wrapper {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          width: calc(100% - 260px);
        }

        /* Top Mobile Header */
        .mobile-header {
          display: none;
          background-color: #0f172a;
          color: #fff;
          padding: 16px 20px;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 90;
          border-bottom: 1px solid #1e293b;
        }

        .mobile-menu-btn {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Main Content Panel */
        .admin-content {
          padding: 40px;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Title block */
        .admin-page-header {
          margin-bottom: 32px;
        }

        .admin-title-subtitle {
          margin-top: 4px;
        }

        /* Dashboard Overview Grid containing Line Chart */
        .analytics-card-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 36px;
        }

        .analytics-chart-panel {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .analytics-metrics-panel {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .metric-row:last-child {
          border-bottom: none;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .metric-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Stats Section */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 36px;
        }

        .stat-card-wrapper {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .stat-card-wrapper.premium {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #fff;
          border: none;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }

        .stat-card-wrapper.premium .stat-header {
          color: #94a3b8;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background-color: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }

        .stat-card-wrapper.premium .stat-icon {
          background-color: #1e293b;
          color: #fbbf24;
        }

        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 30px;
          font-weight: 700;
          margin-top: 12px;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .stat-card-wrapper.premium .stat-value {
          color: #fff;
        }

        .stat-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 12px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }

        .stat-card-wrapper.premium .stat-desc {
          color: #94a3b8;
          border-top: 1px solid #1e293b;
        }

        /* Card and Table layouts */
        .content-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .card-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* Warning banner */
        .warning-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 13.5px;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* Filters & Controls bar */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--border);
          background-color: var(--bg-card);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background-color: var(--bg-main);
          color: var(--text-main);
        }

        .filter-btn.active {
          background-color: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }

        .theme-dark .filter-btn.active {
          background-color: #fbbf24;
          color: #0f172a;
          border-color: #fbbf24;
        }

        .select-sort-dropdown {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background-color: var(--bg-card);
          color: var(--text-main);
          font-size: 13px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        /* Search Input Styling */
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          padding: 10px 14px 10px 38px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background-color: var(--input-bg);
          color: var(--text-main);
          font-size: 13px;
          width: 240px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
        }

        .search-icon-svg {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          width: 16px;
          height: 16px;
        }

        /* Table styling */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background-color: var(--table-header);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
        }

        .admin-table td {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-main);
          vertical-align: middle;
        }

        .admin-table tr:hover {
          background-color: var(--table-header);
        }

        .admin-table tr.cancelled-row {
          background-color: rgba(239, 68, 68, 0.05);
        }

        .admin-table tr.cancelled-row:hover {
          background-color: rgba(239, 68, 68, 0.08);
        }

        /* Select dropdowns in table */
        .status-select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-select.status-paid {
          background-color: #ecfdf5;
          color: #047857;
          border-color: #a7f3d0;
        }

        .status-select.status-shipped {
          background-color: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .status-select.status-delivered {
          background-color: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
        }

        .status-select.status-cancelled {
          background-color: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        /* Standard Buttons */
        .btn-primary {
          padding: 10px 20px;
          background-color: #0f172a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .theme-dark .btn-primary {
          background-color: #fbbf24;
          color: #0f172a;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-secondary {
          padding: 10px 20px;
          background-color: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          background-color: var(--border);
        }

        .btn-success {
          padding: 10px 20px;
          background-color: #10b981;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-success:hover {
          background-color: #059669;
        }

        /* Products Tab Layout */
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .product-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        .product-card-img-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          background-color: var(--bg-main);
        }

        .product-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          text-transform: uppercase;
        }

        .product-card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .product-card-price {
          font-size: 18px;
          font-weight: 800;
          color: #059669;
          margin-bottom: 12px;
        }

        .product-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          align-items: center;
        }

        .stock-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .stock-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .stock-dot.in-stock {
          background-color: #10b981;
        }

        .stock-dot.low-stock {
          background-color: #f59e0b;
        }

        .product-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .product-card-actions button {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .product-card-actions .edit-btn {
          background-color: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--border);
        }

        .product-card-actions .edit-btn:hover {
          background-color: var(--border);
        }

        .product-card-actions .delete-btn {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .product-card-actions .delete-btn:hover {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        /* Category Tab Layout */
        .categories-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
        }

        /* Form Styles */
        .form-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          box-shadow: var(--shadow);
        }

        .form-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 20px;
          width: 100%;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
        }

        .form-textarea {
          width: 100%;
          padding: 10px 14px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-textarea:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
        }

        .file-upload-card {
          border: 2px dashed var(--border);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          background-color: var(--bg-main);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .file-upload-card:hover {
          border-color: var(--text-muted);
          background-color: var(--border);
        }

        .file-upload-input {
          display: none;
        }

        .file-upload-preview {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }

        /* Category List Items */
        .category-item {
          display: grid;
          grid-template-columns: 60px 1fr 90px 110px 100px;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background-color 0.2s;
        }

        .category-item:hover {
          background-color: var(--table-header);
        }

        .category-icon-input {
          text-align: center;
          font-size: 20px;
        }

        .category-status-btn {
          padding: 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-align: center;
        }

        .category-status-btn.active {
          background-color: #dcfce7;
          color: #166534;
        }

        .category-status-btn.active:hover {
          background-color: #bbf7d0;
        }

        .category-status-btn.inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .category-status-btn.inactive:hover {
          background-color: #fca5a5;
        }

        .category-delete-btn {
          padding: 8px;
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-delete-btn:hover {
          background-color: #ef4444;
          color: #fff;
        }

        /* Order tracking flow indicators */
        .timeline-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0;
          position: relative;
        }
        
        .timeline-line {
          position: absolute;
          top: 15px;
          left: 10%;
          right: 10%;
          height: 4px;
          background-color: var(--border);
          z-index: 1;
        }
        
        .timeline-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: #10b981;
          transition: width 0.4s ease;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          width: 25%;
        }

        .timeline-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-card);
          border: 3px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          transition: all 0.3s;
        }

        .timeline-step.completed .timeline-dot {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .timeline-step.active .timeline-dot {
          border-color: #10b981;
          color: #10b981;
        }

        .timeline-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          margin-top: 8px;
          text-transform: uppercase;
          text-align: center;
        }

        .timeline-step.completed .timeline-label,
        .timeline-step.active .timeline-label {
          color: var(--text-main);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-container {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          background-color: var(--bg-card);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 20px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title-group h2 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main);
        }

        .modal-title-group p {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .modal-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background-color: var(--bg-main);
          color: var(--text-muted);
          cursor: pointer;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background-color: var(--border);
          color: var(--text-main);
        }

        .modal-body {
          padding: 28px;
          overflow-y: auto;
        }

        .modal-info-card {
          background-color: var(--table-header);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .modal-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .info-item-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .info-item-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 4px;
        }

        .modal-status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .modal-status-badge.status-paid {
          background-color: #d1fae5;
          color: #065f46;
        }

        .modal-status-badge.status-shipped {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .modal-status-badge.status-delivered {
          background-color: #d1fae5;
          color: #166534;
        }

        .modal-status-badge.status-cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .modal-address-block {
          margin-top: 20px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .address-box {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-main);
          margin-top: 6px;
        }

        .ordered-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ordered-item {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }

        .ordered-item:hover {
          background-color: var(--table-header);
        }

        .ordered-item-name {
          font-weight: 700;
          color: var(--text-main);
        }

        .ordered-item-qty {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .ordered-item-total {
          font-size: 16px;
          font-weight: 800;
          color: #059669;
        }

        .modal-footer {
          padding: 20px 28px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-total-amount {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--text-main);
          margin-top: 4px;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Mobile Sidebar Drawer Overlay */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(2px);
          z-index: 95;
        }

        /* Print formatting */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .modal-overlay, .modal-overlay * {
            visibility: visible !important;
          }
          .modal-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: none !important;
            backdrop-filter: none !important;
          }
          .modal-container {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          .modal-close-btn, .modal-footer .btn-primary, .theme-toggle-btn {
            display: none !important;
          }
        }

        /* ==================== MEDIA QUERIES ==================== */
        @media (max-width: 1024px) {
          .categories-layout {
            grid-template-columns: 1fr;
          }
          .analytics-card-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-panel {
            flex-direction: column !important;
          }

          .admin-sidebar {
            transform: translateX(-100%) !important;
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 260px !important;
            height: 100vh !important;
            z-index: 10000 !important;
            display: flex !important;
            flex-direction: column !important;
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.25) !important;
          }

          .admin-sidebar.open {
            transform: translateX(0) !important;
          }

          .sidebar-overlay {
            display: none !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 9995 !important;
            background-color: rgba(15, 23, 42, 0.4) !important;
            backdrop-filter: blur(2px) !important;
          }

          .sidebar-overlay.open {
            display: block !important;
          }

          .admin-main-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .mobile-header {
            display: flex !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 9990 !important;
          }

          .admin-content {
            padding: 24px 16px;
          }

          /* Tables convert to cards */
          .admin-table, 
          .admin-table thead, 
          .admin-table tbody, 
          .admin-table th, 
          .admin-table td, 
          .admin-table tr {
            display: block;
          }

          .admin-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }

          .admin-table tr {
            margin-bottom: 16px;
            border: 1px solid var(--border);
            border-radius: 12px;
            background-color: var(--bg-card);
            padding: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }

          .admin-table td {
            border: none;
            position: relative;
            padding: 8px 12px 8px 50% !important;
            text-align: right !important;
            font-size: 13px;
            min-height: 36px;
            border-bottom: 1px dashed var(--border);
          }

          .admin-table td:last-child {
            border-bottom: none;
            text-align: center !important;
            padding-left: 12px !important;
            margin-top: 10px;
          }

          .admin-table td:before {
            content: attr(data-label);
            position: absolute;
            left: 12px;
            width: 45%;
            text-align: left;
            font-weight: 600;
            color: var(--text-muted);
          }

          .admin-table td:last-child:before {
            content: "";
          }

          /* Form row elements stack */
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          /* Category List Stack */
          .category-item {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 16px;
            border-bottom: 1px solid var(--border);
          }

          .category-item > * {
            width: 100% !important;
            text-align: left !important;
          }

          .category-icon-input {
            width: 60px !important;
            text-align: center !important;
            margin: 0 auto;
          }

          .category-status-btn {
            text-align: center !important;
          }

          .category-delete-btn {
            text-align: center !important;
          }

          /* Top filters stack */
          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            width: 100%;
          }

          .filter-group {
            justify-content: flex-start;
          }

          .modal-container {
            max-height: 95vh;
            border-radius: 16px;
          }
          .modal-body {
            padding: 20px;
          }
          .modal-header, .modal-footer {
            padding: 16px 20px;
          }
        }
      `}</style>

      {/* Toast Notification overlay */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-message toast-${t.type}`}>
            <span style={{ display: "inline-flex", padding: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }}>
              {t.type === "success" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              )}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" aria-label="Open Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#fff' }}>ANJISJEWEL <span style={{ color: "#fbbf24" }}>admin</span></span>
        </div>
        <button onClick={toggleTheme} className="theme-toggle-btn" style={{ padding: "6px 10px" }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Sidebar navigation */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          ANJISJEWEL <span style={{ color: "#fbbf24" }}>admin</span>
        </div>
        
        <div className="sidebar-nav">
          <button 
            onClick={() => { setTab("orders"); setSidebarOpen(false); }} 
            className={`sidebar-btn ${tab === "orders" ? "active" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Orders
          </button>
          
          <button 
            onClick={() => { setTab("products"); setSidebarOpen(false); }} 
            className={`sidebar-btn ${tab === "products" ? "active" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>
            Products
          </button>
          
          <button 
            onClick={() => { setTab("categories"); setSidebarOpen(false); }} 
            className={`sidebar-btn ${tab === "categories" ? "active" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Categories
          </button>
        </div>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <div>Logged in as:</div>
          <div className="sidebar-user">
            {supabase.auth.getUser()?.email || "Admin User"}
          </div>
        </div>
      </div>

      {/* Sidebar mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="admin-main-wrapper">
        <div className="admin-content">
          <div className="admin-page-header">
            <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Admin Panel</span>
            <div className="admin-title-subtitle">
              <h1 style={{ fontSize: "30px", fontWeight: "800", margin: "4px 0 0 0", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>Dashboard</h1>
              <p style={{ color: "var(--text-muted)", margin: "6px 0 0 0", fontSize: "14px", fontWeight: "500" }}>Manage orders, products, categories and business insights</p>
            </div>
          </div>

          {/* DASHBOARD ANALYTICS OVERVIEW */}
          {tab === "orders" && (
            <div className="analytics-card-layout">
              <div className="analytics-chart-panel">
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Weekly Sales Trend (₹)</h3>
                
                {/* SVG Area Chart */}
                <div style={{ width: "100%", overflow: "hidden" }}>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={paddingY + drawHeight / 2} x2={chartWidth - paddingX} y2={paddingY + drawHeight / 2} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="var(--chart-grid)" />

                    {/* Chart Area Fill */}
                    {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

                    {/* Chart Glowing Line */}
                    {linePath && <path d={linePath} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />}

                    {/* Data Point Dots & Labels */}
                    {points.map((p, index) => (
                      <g key={index}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#fbbf24" stroke="var(--bg-card)" strokeWidth="2" />
                        <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="700" fill="var(--text-main)" textAnchor="middle">
                          {p.val > 0 ? `₹${p.val}` : ""}
                        </text>
                        <text x={p.x} y={chartHeight - 4} fontSize="9" fontWeight="600" fill="var(--text-muted)" textAnchor="middle">
                          {p.date}
                        </text>
                      </g>
                    ))}

                    {/* Y-Axis Value Labels */}
                    <text x={paddingX - 6} y={paddingY + 3} fontSize="9" fontWeight="600" fill="var(--text-muted)" textAnchor="end">₹{maxSalesVal}</text>
                    <text x={paddingX - 6} y={paddingY + drawHeight / 2 + 3} fontSize="9" fontWeight="600" fill="var(--text-muted)" textAnchor="end">₹{midSalesVal}</text>
                    <text x={paddingX - 6} y={chartHeight - paddingY + 3} fontSize="9" fontWeight="600" fill="var(--text-muted)" textAnchor="end">₹0</text>
                  </svg>
                </div>
              </div>

              <div className="analytics-metrics-panel">
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Quick Analytics</h3>
                
                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                  <div className="metric-row">
                    <span className="metric-label">Average Order Value (AOV)</span>
                    <span className="metric-value" style={{ color: "#059669" }}>₹{avgOrderValue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Paid Orders Rate</span>
                    <span className="metric-value">
                      {orders.length > 0 
                        ? `${Math.round((orders.filter(o => o.status === "paid" || o.status === "delivered" || o.status === "shipped").length / orders.length) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Low Stock Alarms</span>
                    <span className="metric-value" style={{ color: lowStockProducts.length > 0 ? "#d97706" : "var(--text-main)" }}>
                      {lowStockProducts.length} Items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD STATS */}
          <div className="stats-grid">
            {/* Revenue */}
            <div className="stat-card-wrapper premium">
              <div className="stat-header">
                <span>Total Revenue</span>
                <span className="stat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </span>
              </div>
              <div className="stat-value">
                ₹{orders
                  .filter(o => o.status !== "cancelled")
                  .reduce((sum, o) => sum + Number(o.total || 0), 0)
                  .toLocaleString("en-IN")}
              </div>
              <div className="stat-desc">Revenue from non-cancelled orders</div>
            </div>

            {/* Orders */}
            <div className="stat-card-wrapper">
              <div className="stat-header">
                <span>Total Orders</span>
                <span className="stat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </span>
              </div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-desc">{orders.filter(o => o.status === "paid").length} paid orders</div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="stat-card-wrapper">
              <div className="stat-header">
                <span>Avg Order Value (AOV)</span>
                <span className="stat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </span>
              </div>
              <div className="stat-value">₹{avgOrderValue.toLocaleString("en-IN")}</div>
              <div className="stat-desc">Average spent per valid order</div>
            </div>

            {/* Products */}
            <div className="stat-card-wrapper">
              <div className="stat-header">
                <span>Total Products</span>
                <span className="stat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>
                </span>
              </div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-desc" style={{ color: lowStockProducts.length > 0 ? "#ef4444" : "var(--text-muted)", fontWeight: lowStockProducts.length > 0 ? "700" : "400" }}>
                {lowStockProducts.length} low stock products
              </div>
            </div>
          </div>

          {/* ==================== ORDERS TAB ==================== */}
          {tab === "orders" && (
            <div className="content-card">
              <div className="card-header">
                <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: "18px", fontWeight: "700" }}>Manage Orders</h3>
              </div>
              <div style={{ padding: "24px" }}>
                <div className="controls-bar">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                    
                    {/* Status Filters */}
                    <div className="filter-group">
                      {["all", "paid", "shipped", "delivered", "cancelled"].map(s => (
                        <button
                          key={s}
                          onClick={() => setFilter(s)}
                          className={`filter-btn ${filter === s ? "active" : ""}`}
                        >
                          {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Date Filters */}
                    <div className="filter-group">
                      {["all", "today", "yesterday", "week", "month"].map(d => (
                        <button
                          key={d}
                          onClick={() => setDateFilter(d)}
                          className={`filter-btn ${dateFilter === d ? "active" : ""}`}
                          style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px" }}
                        >
                          {d === "all" ? "All Time" : d === "week" ? "Last 7 Days" : d === "month" ? "Last 30 Days" : d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>

                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%", marginTop: "12px" }}>
                    {/* Multi-column Search */}
                    <div className="search-input-wrapper" style={{ flex: "1 1 200px" }}>
                      <svg className="search-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input
                        type="text"
                        placeholder="Search ID, customer name, phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="search-input"
                        style={{ width: "100%" }}
                      />
                    </div>

                    {/* Sorting dropdown */}
                    <select
                      value={orderSortBy}
                      onChange={(e) => setOrderSortBy(e.target.value)}
                      className="select-sort-dropdown"
                    >
                      <option value="date-desc">Newest Orders</option>
                      <option value="date-asc">Oldest Orders</option>
                      <option value="total-desc">Highest Total (₹)</option>
                      <option value="total-asc">Lowest Total (₹)</option>
                    </select>
                    
                    <button onClick={exportOrdersToExcel} className="btn-success">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Export Excel
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date & Time</th>
                        <th>Customer Details</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                            No orders found matching the filter or search criteria.
                          </td>
                        </tr>
                      ) : (
                        sortedOrders.map(order => (
                          <tr key={order.id} className={order.status === "cancelled" ? "cancelled-row" : ""}>
                            <td data-label="Order ID">
                              <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>
                                #{order.order_id}
                              </div>
                            </td>
                            <td data-label="Date & Time">
                              <div style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "13.5px" }}>
                                {formatDateTime(order.created_at)}
                              </div>
                            </td>
                            <td data-label="Customer Details" style={{ lineHeight: "1.5" }}>
                              <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                                {order.shipping_name || "N/A"}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {order.shipping_phone || "N/A"}
                              </div>
                              <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                                {[
                                  order.shipping_address,
                                  order.shipping_city,
                                  order.shipping_state,
                                  order.shipping_pincode,
                                  order.shipping_country,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "Address not available"}
                              </div>
                            </td>
                            <td data-label="Total">
                              <div style={{ fontWeight: "800", color: "#059669", fontSize: "15px" }}>
                                ₹{Number(order.total).toLocaleString("en-IN")}
                              </div>
                            </td>
                            <td data-label="Status">
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className={`status-select status-${order.status}`}
                              >
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td data-label="Actions" style={{ textAlign: "center" }}>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                                className="btn-primary"
                                style={{ padding: "8px 14px", fontSize: "12px" }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PRODUCTS TAB ==================== */}
          {tab === "products" && (
            <>
              {/* Inventory Alert Banner */}
              {lowStockProducts.length > 0 && !showForm && !editProduct && (
                <div className="warning-banner">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#b45309" }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span><strong>Inventory Alert:</strong> {lowStockProducts.length} items are running low (stock &le; 5).</span>
                  </div>
                  <button 
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)} 
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px", background: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }}
                  >
                    {showLowStockOnly ? "Show All Products" : "Quick View Low Stock"}
                  </button>
                </div>
              )}

              {!showForm && !editProduct && (
                <div className="products-header">
                  <div className="filter-group">
                    {["All", ...categories.map(c => c.name)].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCatFilter(cat)}
                        className={`filter-btn ${catFilter === cat ? "active" : ""}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {/* Sort Options */}
                    <select
                      value={productSortBy}
                      onChange={(e) => setProductSortBy(e.target.value)}
                      className="select-sort-dropdown"
                    >
                      <option value="newest">Newest Added</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="stock-asc">Low Stock First</option>
                    </select>

                    <button onClick={() => setShowForm(true)} className="btn-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Product
                    </button>
                  </div>
                </div>
              )}

              {(showForm || editProduct) && (
                <ProductForm
                  initial={editProduct}
                  categories={categories}
                  showToast={showToast}
                  onSave={() => { setShowForm(false); setEditProduct(null); loadProducts(); }}
                  onCancel={() => { setShowForm(false); setEditProduct(null); }}
                />
              )}

              {!showForm && !editProduct && (
                <div className="product-grid">
                  {displayProducts.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", color: "var(--text-muted)" }}>
                      No products found in this category.
                    </div>
                  ) : (
                    displayProducts.map(p => (
                      <div className="product-card" key={p.id}>
                        <div className="product-card-img-wrapper">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/600x600?text=No+Image";
                              }}
                              className="product-card-img"
                            />
                          ) : (
                            <img
                              src="https://placehold.co/600x600?text=No+Image"
                              alt="No image available"
                              className="product-card-img"
                            />
                          )}
                          <span className="product-tag">{p.category}</span>
                        </div>
                        <div className="product-card-content">
                          <h4 className="product-card-title">{p.name}</h4>
                          <div className="product-card-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
                          
                          <div className="product-card-meta">
                            <span className="stock-indicator">
                              <span className={`stock-dot ${Number(p.stock) > 5 ? 'in-stock' : 'low-stock'}`}></span>
                              Stock: <strong>{p.stock}</strong>
                            </span>
                            
                            {/* Quick Restock Action */}
                            <button
                              onClick={() => quickRestock(p.id, p.stock, 10)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                background: "rgba(16, 185, 129, 0.1)",
                                color: "#10b981",
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "700"
                              }}
                              title="Quick Restock +10"
                            >
                              +10 Stock
                            </button>
                          </div>
                          
                          <div className="product-card-actions">
                            <button onClick={() => setEditProduct(p)} className="edit-btn">Edit</button>
                            <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} className="delete-btn">
                              {deleting === p.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* ==================== CATEGORIES TAB ==================== */}
          {tab === "categories" && (
            <div className="categories-layout">
              {/* Add Category */}
              <div className="form-card">
                <h2 className="form-title">Add New Category</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className="form-label">Category Name *</label>
                    <input value={categoryDraft.name} onChange={e => setCategoryDraft({ ...categoryDraft, name: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Icon</label>
                      <input value={categoryDraft.icon} onChange={e => setCategoryDraft({ ...categoryDraft, icon: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sort Order</label>
                      <input type="number" value={categoryDraft.sort_order} onChange={e => setCategoryDraft({ ...categoryDraft, sort_order: e.target.value })} className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea value={categoryDraft.description} onChange={e => setCategoryDraft({ ...categoryDraft, description: e.target.value })} className="form-textarea" style={{ height: "80px" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL (Optional)</label>
                    <input value={categoryDraft.image} onChange={e => setCategoryDraft({ ...categoryDraft, image: e.target.value })} className="form-input" />
                  </div>

                  {categoryError && <div style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600" }}>{categoryError}</div>}

                  <button onClick={saveCategory} disabled={categorySaving} className="btn-primary" style={{ justifyContent: "center", width: "100%", padding: "12px", marginTop: "8px" }}>
                    {categorySaving ? "Saving..." : "+ Add Category"}
                  </button>
                </div>
              </div>

              {/* Categories List */}
              <div className="content-card">
                <div style={{ padding: "20px 24px", fontWeight: "700", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "16px" }}>All Categories</span>
                  <span style={{ fontSize: "12px", background: "var(--border)", padding: "4px 8px", borderRadius: "9999px", color: "var(--text-main)", fontWeight: "700" }}>{categories.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {categories.map((cat, index) => (
                    <div key={cat.id || index} className="category-item">
                      <input value={cat.icon || ""} onChange={e => updateCategory(cat, { icon: e.target.value })} className="form-input category-icon-input" />
                      <div>
                        <input value={cat.name} onChange={e => updateCategory(cat, { name: e.target.value })} className="form-input" style={{ fontWeight: "700", marginBottom: "6px" }} />
                        <input value={cat.description || ""} onChange={e => updateCategory(cat, { description: e.target.value })} placeholder="Description" className="form-input" style={{ fontSize: "13px" }} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "11px", marginBottom: "2px" }}>Sort Order</label>
                        <input type="number" value={cat.sort_order} onChange={e => updateCategory(cat, { sort_order: Number(e.target.value) })} className="form-input" />
                      </div>
                      <button
                        onClick={() => updateCategory(cat, { is_active: !cat.is_active })}
                        className={`category-status-btn ${cat.is_active ? 'active' : 'inactive'}`}
                      >
                        {cat.is_active ? "Active" : "Hidden"}
                      </button>
                      <button onClick={() => deleteCategory(cat)} className="category-delete-btn">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <div className="modal-title-group">
                <h2>Order Details</h2>
                <p>Order #{selectedOrder.order_id}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="modal-close-btn">&times;</button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              {/* Interactive Progress Tracking Flow */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Order Status Flow</h4>
                
                {selectedOrder.status === "cancelled" ? (
                  <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "10px", fontWeight: "600", fontSize: "13px" }}>
                    ⚠️ This order was cancelled.
                  </div>
                ) : (
                  <div className="timeline-container">
                    <div className="timeline-line">
                      <div className="timeline-line-fill" style={{ 
                        width: selectedOrder.status === "paid" ? "0%" : selectedOrder.status === "shipped" ? "50%" : "100%" 
                      }} />
                    </div>
                    
                    <div className={`timeline-step ${selectedOrder.status === "paid" || selectedOrder.status === "shipped" || selectedOrder.status === "delivered" ? "completed" : ""}`}>
                      <div className="timeline-dot">1</div>
                      <div className="timeline-label">Paid</div>
                    </div>
                    
                    <div className={`timeline-step ${selectedOrder.status === "shipped" || selectedOrder.status === "delivered" ? "completed" : selectedOrder.status === "paid" ? "active" : ""}`}>
                      <div className="timeline-dot">2</div>
                      <div className="timeline-label">Shipped</div>
                    </div>
                    
                    <div className={`timeline-step ${selectedOrder.status === "delivered" ? "completed" : selectedOrder.status === "shipped" ? "active" : ""}`}>
                      <div className="timeline-dot">3</div>
                      <div className="timeline-label">Delivered</div>
                    </div>
                  </div>
                )}
              </div>

              {/* CUSTOMER INFO */}
              <div className="modal-info-card">
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif" }}>Customer Information</h3>
                
                <div className="modal-info-grid">
                  <div>
                    <div className="info-item-label">Customer Name</div>
                    <div className="info-item-value">{selectedOrder.shipping_name || "N/A"}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Phone Number</div>
                    <div className="info-item-value">{selectedOrder.shipping_phone || "N/A"}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Order Date & Time</div>
                    <div className="info-item-value">{new Date(selectedOrder.created_at).toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Status</div>
                    <div style={{ marginTop: "4px" }}>
                      <span className={`modal-status-badge status-${selectedOrder.status}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="modal-address-block">
                  <div className="info-item-label">Shipping Address</div>
                  <div className="address-box">
                    {[
                      selectedOrder.shipping_address,
                      selectedOrder.shipping_city,
                      selectedOrder.shipping_state,
                      selectedOrder.shipping_pincode,
                      selectedOrder.shipping_country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Address not available"}
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif" }}>Ordered Products</h3>
                <div className="ordered-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div className="ordered-item" key={index}>
                      <div>
                        <div className="ordered-item-name">{item.name}</div>
                        <div className="ordered-item-qty">Qty: {item.quantity} &times; ₹{Number(item.price).toLocaleString("en-IN")}</div>
                      </div>
                      <div className="ordered-item-total">₹{Number(item.price * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <div>
                <div className="info-item-label">Total Amount</div>
                <div className="modal-total-amount">₹{Number(selectedOrder.total).toLocaleString("en-IN")}</div>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                {/* Print Invoice Feature */}
                <button onClick={() => window.print()} className="btn-secondary">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print Invoice
                </button>
                <button onClick={() => setShowOrderModal(false)} className="btn-primary" style={{ padding: "12px 24px" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}