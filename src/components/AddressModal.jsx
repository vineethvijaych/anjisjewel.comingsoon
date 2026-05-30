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

  const isMobile = window.innerWidth < 768;

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  const [viewportHeight, setViewportHeight] =
    useState(window.innerHeight);

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
  }, [user]);

  useEffect(() => {
    const initialHeight =
      window.innerHeight;

    const handleResize = () => {
      const currentHeight =
        window.innerHeight;

      setViewportHeight(currentHeight);

      if (
        initialHeight - currentHeight >
        150
      ) {
        setKeyboardOpen(true);
      } else {
        setKeyboardOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  const loadAddresses = async () => {
    try {
      if (!user?.id) return;

      const { data, error } =
        await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", {
            ascending: false,
          });

      console.log(
        "Addresses:",
        data
      );

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
    if (!form.full_name.trim())
      return "Full name required";

    if (
      !form.phone.trim() ||
      form.phone.length !== 10
    )
      return "Valid 10 digit phone required";

    if (!form.line1.trim())
      return "Address line 1 required";

    if (!form.city.trim())
      return "City required";

    if (!form.state.trim())
      return "State required";

    if (
      !form.pincode.trim() ||
      form.pincode.length !== 6
    )
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
   
    console.log(
      "CONTINUE CLICKED"
    );

    setErr("");

    if (!user?.id) {
      setErr(
        "User not loaded. Login again."
      );
      return;
    }

    try {
      setLoading(true);

      if (
        mode === "saved" &&
        selected
      ) {
        console.log(
          "Selected address:",
          selected
        );

        if (
          typeof onConfirm ===
          "function"
        ) {
          onConfirm(selected);
        }

        return;
      }

      const validationError =
  validate();



if (
  mode === "edit" &&
  selected
) {
  const { data, error } =
    await supabase
      .from("addresses")
      .update({
        ...form,
      })
      .eq(
        "id",
        selected.id
      )
      .select()
      .single();

  if (error) {
    setErr(error.message);
    return;
  }

  if (
    typeof onConfirm ===
    "function"
  ) {
    onConfirm(data);
  }

  return;
}

      if (validationError) {
        setErr(validationError);

        console.log(
          validationError
        );

        return;
      }

      const { data, error } =
        await supabase
          .from("addresses")
          .insert({
            ...form,
            user_id: user.id,
            is_default:
              saved.length === 0,
          })
          .select()
          .single();

      console.log(
        "Insert:",
        data
      );

      console.log(
        "Insert Error:",
        error
      );

      if (error) {
        setErr(error.message);
        return;
      }

      if (
        typeof onConfirm ===
        "function"
      ) {
        onConfirm(data);
      }
    } catch (e) {
      console.log(e);

      setErr(
        e.message ||
          "Something went wrong"
      );
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

  const inputStyle = {
    width: "100%",
    padding: "12px",
    background: "#fff",
    border: "1px solid #ccc",
    color: "#111",
    fontSize: 16,
    borderRadius: "6px",
    marginBottom: 16,
    outline: "none",
    boxSizing: "border-box",
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
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: isMobile
          ? "flex-start"
          : "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: isMobile
            ? `${viewportHeight}px`
            : "auto",
          background: "#f9f9f9",
          padding: "20px",
          overflowY: "auto",
          borderRadius: isMobile
            ? "0"
            : "12px",
          paddingBottom:
            keyboardOpen
              ? "260px"
              : "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: 20,
          }}
        >
          <h2>
            Shipping Address
          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {saved.length > 0 && (
          <>
            <p>
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
      padding: 12,
      border: "1px solid #ddd",
      marginBottom: 10,
      cursor: "pointer",
      background:
        selected?.id === addr.id
          ? "#e6f0ff"
          : "#fff",
    }}
  >
    <strong>
      {addr.full_name}
    </strong>

    <br />

    {addr.line1},{" "}
    {addr.city},{" "}
    {addr.state}

    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 10,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();

          setForm({
            full_name:
              addr.full_name || "",
            phone:
              addr.phone || "",
            line1:
              addr.line1 || "",
            line2:
              addr.line2 || "",
            city:
              addr.city || "",
            state:
              addr.state || "",
            pincode:
              addr.pincode || "",
          });

          setSelected(addr);
          setMode("edit");
        }}
        style={{
          padding: "6px 12px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          borderRadius: "4px",
        }}
      >
        Edit
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();

          handleDelete(
            addr.id
          );
        }}
        style={{
          padding: "6px 12px",
          border: "none",
          background:
            "#dc2626",
          color: "#fff",
          cursor: "pointer",
          borderRadius: "4px",
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
            >
              + Add New Address
            </button>
          </>
        )}

        {(mode === "new" ||
  mode === "edit") && (
          <>
            <input
              style={inputStyle}
              placeholder="Full Name"
              value={
                form.full_name
              }
              onFocus={
                scrollIntoView
              }
              onChange={(e) =>
                set(
                  "full_name",
                  e.target.value
                )
              }
            />

            <input
              style={inputStyle}
              placeholder="Phone"
              value={form.phone}
              onFocus={
                scrollIntoView
              }
              onChange={(e) =>
                set(
                  "phone",
                  e.target.value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(
                      0,
                      10
                    )
                )
              }
            />

            <input
              style={inputStyle}
              placeholder="Address"
              value={form.line1}
              onFocus={
                scrollIntoView
              }
              onChange={(e) =>
                set(
                  "line1",
                  e.target.value
                )
              }
            />

            <input
              style={inputStyle}
              placeholder="City"
              value={form.city}
              onFocus={
                scrollIntoView
              }
              onChange={(e) =>
                set(
                  "city",
                  e.target.value
                )
              }
            />

            <select
  style={inputStyle}
  value={form.state}
  onFocus={scrollIntoView}
  onChange={(e) =>
    set("state", e.target.value)
  }
>
  <option value="">
    Select State / UT
  </option>

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

            <input
              style={inputStyle}
              placeholder="Pincode"
              value={
                form.pincode
              }
              onFocus={
                scrollIntoView
              }
              onChange={(e) =>
                set(
                  "pincode",
                  e.target.value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(0, 6)
                )
              }
            />
          </>
        )}

        {err && (
          <div
            style={{
              color: "red",
              marginTop: 10,
            }}
          >
            {err}
          </div>
        )}

        <button
          onClick={
            handleConfirm
          }
          disabled={loading}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            background:
              loading
                ? "#666"
                : "#0d2818",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading
            ? "Processing..."
            : "Continue to Payment →"}
        </button>
      </div>
    </div>
  );
}