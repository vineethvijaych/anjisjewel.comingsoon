import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";

export default function AddressModal({ onConfirm, onClose }) {
  const { user } = useCart();
  const [saved, setSaved] = useState([]);
  const [mode, setMode] = useState("saved");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [err, setErr] = useState("");

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    setSaved(data || []);

    if (data?.length > 0) {
      setSelected(data[0]);
      setMode("saved");
    } else {
      setMode("new");
    }
  };

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const validate = () => {
    if (!form.full_name.trim()) return "Full name required";
    if (!form.phone.trim() || form.phone.length < 10)
      return "Valid 10-digit phone required";
    if (!form.line1.trim()) return "Address line 1 required";
    if (!form.city.trim()) return "City required";
    if (!form.state.trim()) return "State required";
    if (!form.pincode.trim() || form.pincode.length < 6)
      return "Valid 6-digit pincode required";
    return null;
  };

  const handleConfirm = async () => {
    if (mode === "saved" && selected) {
      onConfirm(selected);
      return;
    }

    const e = validate();
    if (e) {
      setErr(e);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        ...form,
        user_id: user.id,
        is_default: saved.length === 0,
      })
      .select()
      .single();

    if (error) {
      setErr(error.message);
      return;
    }

    onConfirm(data);
  };

  // 🔥 FIXED STYLES
  const inputStyle = {
    width: "100%",
    padding: "12px",
    background: "#fff",
    border: "1px solid #ccc",
    color: "#111",
    fontSize: 14,
    borderRadius: "6px",
    marginBottom: 16,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        padding: isMobile ? "0" : "20px",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: isMobile ? "100vh" : "auto",
          background: "#f9f9f9",
          borderRadius: isMobile ? "0" : "12px",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Shipping Address</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* SAVED ADDRESSES */}
        {saved.length > 0 && (
          <>
            <p style={{ marginBottom: 10, fontWeight: 600 }}>
              Saved Addresses
            </p>

            {saved.map((addr) => (
              <div
                key={addr.id}
                onClick={() => {
                  setSelected(addr);
                  setMode("saved");
                }}
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  marginBottom: "10px",
                  cursor: "pointer",
                  background:
                    selected?.id === addr.id ? "#e6f0ff" : "#fff",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>{addr.full_name}</strong> · {addr.phone}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
                  {addr.line1}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
            ))}

            <button
              onClick={() => {
                setMode("new");
                setSelected(null);
              }}
              style={{
                marginBottom: 20,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              + Add New Address
            </button>
          </>
        )}

        {/* NEW ADDRESS FORM */}
        {mode === "new" && (
          <>
            <p style={{ fontWeight: 600 }}>New Address</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) =>
                    set(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                />
              </div>
            </div>

            <label style={labelStyle}>Address Line 1</label>
            <input
              style={inputStyle}
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
            />

            <label style={labelStyle}>Address Line 2</label>
            <input
              style={inputStyle}
              value={form.line2}
              onChange={(e) => set("line2", e.target.value)}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <label style={labelStyle}>City</label>
                <input
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>State</label>
                <input
                  style={inputStyle}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Pincode</label>
                <input
                  style={inputStyle}
                  value={form.pincode}
                  onChange={(e) =>
                    set(
                      "pincode",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* ERROR */}
        {err && (
          <div style={{ color: "red", marginTop: 10 }}>{err}</div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleConfirm}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px",
            background: "#0d2818",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}