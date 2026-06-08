import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";

export default function AddressModal({
  onConfirm,
  onClose,
}) {
  const { user } = useCart();
  const [saved, setSaved] = useState([]);
  const [mode, setMode] = useState("saved");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Handle resize for mobile detection and keyboard
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      setIsMobile(currentWidth < 768);
      setViewportHeight(currentHeight);

      if (window.innerHeight < 500) {
        setKeyboardOpen(true);
      } else {
        setKeyboardOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) {
        console.log(error);
        return;
      }
      setSaved(data || []);
      if (data?.length > 0) {
        setSelected(data[0]);
        setMode("saved");
      } else {
        setMode("new");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const set = (field, val) =>
    setForm((prev) => ({
      ...prev,
      [field]: val,
    }));

  const validate = () => {
    if (!form.full_name.trim()) return "Full name required";
    if (!form.phone.trim() || form.phone.length !== 10)
      return "Valid 10 digit phone required";
    if (!form.line1.trim()) return "Address line 1 required";
    if (!form.city.trim()) return "City required";
    if (!form.state.trim()) return "State required";
    if (!form.pincode.trim() || form.pincode.length !== 6)
      return "Valid pincode required";
    return null;
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);
      if (error) {
        setErr(error.message);
        return;
      }
      await loadAddresses();
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error(err);
      setErr("Failed to delete address");
    }
  };

  const handleConfirm = async () => {
    setErr("");
    if (!user?.id) {
      setErr("User not loaded. Login again.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "saved" && selected) {
        if (typeof onConfirm === "function") {
          onConfirm(selected);
        }
        return;
      }

      const validationError = validate();

      if (mode === "edit" && selected) {
        const { data, error } = await supabase
          .from("addresses")
          .update({ ...form })
          .eq("id", selected.id)
          .select()
          .single();
        if (error) {
          setErr(error.message);
          return;
        }
        if (typeof onConfirm === "function") {
          onConfirm(data);
        }
        return;
      }

      if (validationError) {
        setErr(validationError);
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
      if (typeof onConfirm === "function") {
        onConfirm(data);
      }
    } catch (e) {
      console.log(e);
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scrollIntoView = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  // Luxury styling
  const modalContentStyle = {
    width: "100%",
    maxWidth: "620px",
    height: isMobile ? `${viewportHeight}px` : "auto",
    maxHeight: isMobile ? "100dvh" : "92vh",
    background: "#f4f1ec", // Ivory
    borderRadius: isMobile ? "0" : "16px",
    boxShadow: isMobile 
      ? "none" 
      : "0 25px 70px -15px rgba(8, 18, 12, 0.4)",
    overflowY: "auto",
    padding: isMobile ? "24px 20px 100px" : "40px 48px",
    position: "relative",
    border: isMobile ? "none" : "1px solid #d8b08b",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "1px solid #d8b08b22",
  };

  const titleStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: isMobile ? "28px" : "32px",
    fontWeight: 500,
    color: "#08120c",
    letterSpacing: "0.5px",
    margin: 0,
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    fontSize: "28px",
    color: "#08120c",
    cursor: "pointer",
    padding: "4px 10px",
    lineHeight: 1,
    transition: "all 0.2s ease",
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    background: "#ffffff",
    border: "1px solid #d8b08b55",
    color: "#08120c",
    fontSize: "16px",
    fontFamily: "'Jost', system-ui, sans-serif",
    borderRadius: "8px",
    marginBottom: "20px",
    outline: "none",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Jost', system-ui, sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    color: "#08120c",
    marginBottom: "8px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  const addressCardStyle = (isSelected) => ({
    padding: "24px",
    border: isSelected 
      ? "2px solid #c9a07c" 
      : "1px solid #d8b08b44",
    marginBottom: "16px",
    cursor: "pointer",
    background: "#ffffff",
    borderRadius: "12px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    boxShadow: isSelected 
      ? "0 10px 30px -10px rgba(201, 160, 124, 0.25)" 
      : "none",
  });

  const goldButtonStyle = {
    marginTop: "12px",
    width: "100%",
    padding: "18px 24px",
    background: "#0d2818", // Forest Green
    color: "#f4f1ec", // Ivory
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "'Jost', system-ui, sans-serif",
    fontWeight: 500,
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    boxShadow: "0 4px 12px -4px rgba(13, 40, 24, 0.3)",
  };

  const secondaryButtonStyle = {
    padding: "10px 24px",
    background: "transparent",
    border: "1px solid #c9a07c",
    color: "#08120c",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Jost', system-ui, sans-serif",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8, 18, 12, 0.75)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Shipping Address</h2>
          <button
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Saved Addresses */}
        {saved.length > 0 && mode === "saved" && (
          <div>
            <p
              style={{
                fontFamily: "'Jost', system-ui, sans-serif",
                fontSize: "15px",
                color: "#08120c",
                marginBottom: "20px",
                fontWeight: 400,
                letterSpacing: "0.3px",
              }}
            >
              Select from saved addresses
            </p>

            {saved.map((addr) => (
              <div
                key={addr.id}
                onClick={() => {
                  setSelected(addr);
                  setMode("saved");
                }}
                style={addressCardStyle(selected?.id === addr.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "19px",
                        fontWeight: 500,
                        color: "#08120c",
                      }}
                    >
                      {addr.full_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Jost', system-ui, sans-serif",
                        fontSize: "15px",
                        color: "#444",
                        marginTop: "4px",
                        lineHeight: 1.5,
                      }}
                    >
                      {addr.line1}
                      {addr.line2 && <>, {addr.line2}</>}
                      <br />
                      {addr.city}, {addr.state} {addr.pincode}
                      <br />
                      +91 {addr.phone}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({
                        full_name: addr.full_name || "",
                        phone: addr.phone || "",
                        line1: addr.line1 || "",
                        line2: addr.line2 || "",
                        city: addr.city || "",
                        state: addr.state || "",
                        pincode: addr.pincode || "",
                      });
                      setSelected(addr);
                      setMode("edit");
                    }}
                    style={secondaryButtonStyle}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(addr.id);
                    }}
                    style={{
                      ...secondaryButtonStyle,
                      borderColor: "#9f2a2a",
                      color: "#9f2a2a",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setForm({
                  full_name: "",
                  phone: "",
                  line1: "",
                  line2: "",
                  city: "",
                  state: "",
                  pincode: "",
                });
                setMode("new");
                setSelected(null);
              }}
              style={{
                ...secondaryButtonStyle,
                width: "100%",
                marginTop: "16px",
                borderStyle: "dashed",
                padding: "16px",
                fontSize: "15px",
              }}
            >
              + Add New Address
            </button>
          </div>
        )}

        {/* New / Edit Form */}
        {(mode === "new" || mode === "edit") && (
          <div>
            <div style={labelStyle}>Full Name</div>
            <input
              style={inputStyle}
              placeholder="Enter full name"
              value={form.full_name}
              onFocus={scrollIntoView}
              onChange={(e) => set("full_name", e.target.value)}
            />

            <div style={labelStyle}>Phone Number</div>
            <input
              style={inputStyle}
              placeholder="10 digit mobile number"
              value={form.phone}
              onFocus={scrollIntoView}
              onChange={(e) =>
                set(
                  "phone",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <div style={labelStyle}>Address Line 1</div>
            <input
              style={inputStyle}
              placeholder="House number, street name"
              value={form.line1}
              onFocus={scrollIntoView}
              onChange={(e) => set("line1", e.target.value)}
            />

            <div style={labelStyle}>Address Line 2 (Optional)</div>
            <input
              style={inputStyle}
              placeholder="Apartment, landmark, etc."
              value={form.line2}
              onFocus={scrollIntoView}
              onChange={(e) => set("line2", e.target.value)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <div style={labelStyle}>City</div>
                <input
                  style={inputStyle}
                  placeholder="City"
                  value={form.city}
                  onFocus={scrollIntoView}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Pincode</div>
                <input
                  style={inputStyle}
                  placeholder="Pincode"
                  value={form.pincode}
                  onFocus={scrollIntoView}
                  onChange={(e) =>
                    set(
                      "pincode",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                />
              </div>
            </div>

            <div style={labelStyle}>State / Union Territory</div>
            <select
              style={{
                ...inputStyle,
                padding: "16px 20px",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2308120c' d='M1 1L6 6L11 1' stroke='%2308120c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 20px center",
                backgroundRepeat: "no-repeat",
              }}
              value={form.state}
              onFocus={scrollIntoView}
              onChange={(e) => set("state", e.target.value)}
            >
              <option value="">Select State / UT</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="Delhi">Delhi</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Puducherry">Puducherry</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {err && (
          <div
            style={{
              color: "#9f2a2a",
              background: "rgba(159, 42, 42, 0.08)",
              padding: "12px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              marginTop: "16px",
              borderLeft: "3px solid #9f2a2a",
            }}
          >
            {err}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            ...goldButtonStyle,
            background: loading ? "#555" : "#0d2818",
            marginTop: "32px",
            opacity: loading ? 0.85 : 1,
          }}
        >
          {loading ? "Processing..." : "Continue to Payment →"}
        </button>

        {/* Subtle footer note */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#777",
            marginTop: "24px",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          All deliveries are handled with care by ANJIS JEWEL
        </p>
      </div>
    </div>
  );
}