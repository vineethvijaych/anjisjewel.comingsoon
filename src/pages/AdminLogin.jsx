import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// 🔥 MULTIPLE ADMINS
const ADMIN_EMAILS = [
  "vineethcpz6881@gmail.com",
  "anjithapullaikodi@gmail.com"
];

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    // 🔥 CHECK AGAINST ARRAY
    if (!ADMIN_EMAILS.includes(cleanEmail)) {
      setError("Access denied.");
      return;
    }

    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authErr) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    navigate("/admin/orders");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--forest)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,144,122,0.12)",
          padding: "48px 40px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 300,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            Anjis
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Jewel
            </span>
          </p>

          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Admin Access
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* EMAIL */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 10,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              style={{
                width: "100%",
                padding: "12px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 10,
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* ERROR */}
          {error && (
            <p
              style={{
                fontSize: 12,
                color: "#e08080",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "14px",
              background: loading
                ? "rgba(201,144,122,0.4)"
                : "var(--gold)",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}