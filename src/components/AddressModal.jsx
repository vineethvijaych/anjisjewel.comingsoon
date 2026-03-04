import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";

export default function AddressModal({ onConfirm, onClose }) {
  const { user } = useCart();
  const [saved, setSaved]       = useState([]);
  const [mode, setMode]         = useState("saved");
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({
    full_name: "", phone: "", line1: "", line2: "",
    city: "", state: "", pincode: ""
  });
  const [err, setErr] = useState("");

  useEffect(() => { loadAddresses(); }, []);

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

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const validate = () => {
    if (!form.full_name.trim())                    return "Full name required";
    if (!form.phone.trim() || form.phone.length < 10) return "Valid 10-digit phone required";
    if (!form.line1.trim())                        return "Address line 1 required";
    if (!form.city.trim())                         return "City required";
    if (!form.state.trim())                        return "State required";
    if (!form.pincode.trim() || form.pincode.length < 6) return "Valid 6-digit pincode required";
    return null;
  };

  const handleConfirm = async () => {
    if (mode === "saved" && selected) { onConfirm(selected); return; }
    const e = validate();
    if (e) { setErr(e); return; }
    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...form, user_id: user.id, is_default: saved.length === 0 })
      .select().single();
    if (error) { setErr(error.message); return; }
    onConfirm(data);
  };

  const inputStyle = {
    width: "100%", padding: "13px 0", background: "transparent",
    border: "none", borderBottom: "1px solid rgba(155,144,136,0.25)",
    color: "var(--cream)", fontSize: 15, fontWeight: 300,
    fontFamily: "var(--font-body)", outline: "none", marginBottom: 20,
    transition: "border-color 0.4s"
  };
  const labelStyle = {
    display: "block", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.3em", textTransform: "uppercase",
    color: "var(--stone)", marginBottom: 8
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Shipping Address</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {saved.length > 0 && (
            <>
              <p className="modal-section-label">Saved Addresses</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {saved.map(addr => (
                  <div key={addr.id}
                    onClick={() => { setSelected(addr); setMode("saved"); }}
                    style={{
                      padding: "14px 18px", cursor: "pointer",
                      background: selected?.id === addr.id && mode === "saved"
                        ? "rgba(200,168,75,0.1)" : "var(--royal)",
                      border: `1px solid ${selected?.id === addr.id && mode === "saved"
                        ? "var(--gold)" : "rgba(200,168,75,0.1)"}`,
                      transition: "all 0.3s"
                    }}>
                    <p style={{ fontSize: 13, color: "var(--cream)", marginBottom: 4 }}>
                      <strong>{addr.full_name}</strong> · {addr.phone}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--linen)" }}>
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setMode("new"); setSelected(null); }}
                style={{
                  background: "none", border: "1px solid rgba(200,168,75,0.2)",
                  color: "var(--gold)", padding: "8px 16px", fontSize: 11,
                  letterSpacing: "0.15em", cursor: "pointer", marginBottom: 24,
                  fontFamily: "var(--font-body)"
                }}>
                + Add New Address
              </button>
            </>
          )}

          {mode === "new" && (
            <>
              <p className="modal-section-label">New Address</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} placeholder="As on ID"
                    value={form.full_name} onChange={e => set("full_name", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} placeholder="10-digit mobile"
                    value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))} />
                </div>
              </div>
              <label style={labelStyle}>Address Line 1</label>
              <input style={inputStyle} placeholder="House / Flat / Building / Street"
                value={form.line1} onChange={e => set("line1", e.target.value)} />
              <label style={labelStyle}>Address Line 2 (optional)</label>
              <input style={inputStyle} placeholder="Landmark, Area"
                value={form.line2} onChange={e => set("line2", e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} placeholder="City"
                    value={form.city} onChange={e => set("city", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input style={inputStyle} placeholder="State"
                    value={form.state} onChange={e => set("state", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Pincode</label>
                  <input style={inputStyle} placeholder="6 digits"
                    value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g,"").slice(0,6))} />
                </div>
              </div>
            </>
          )}

          {err && (
            <div style={{
              background: "rgba(185,64,64,0.08)", border: "1px solid rgba(185,64,64,0.25)",
              padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#e08080"
            }}>
              ⚠ &nbsp;{err}
            </div>
          )}

          <button className="pay-btn" onClick={handleConfirm}>
            <span>Continue to Payment →</span>
          </button>
        </div>
      </div>
    </div>
  );
}