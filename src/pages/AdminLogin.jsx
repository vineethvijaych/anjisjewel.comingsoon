import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// 🔥 MULTIPLE ADMINS
const ADMIN_EMAILS = [
  "vineethcpz6881@gmail.com",
  "anjisadmin@gmail.com"
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
      setError("Access denied. Unauthorized email address.");
      return;
    }

    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authErr) {
      setError("Invalid credentials. Please check your password.");
      setLoading(false);
      return;
    }

    navigate("/admin/orders");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d2818", // Forest green
        backgroundImage: `radial-gradient(circle at 10% 20%, rgba(201, 160, 124, 0.05) 0%, transparent 70%),
                          radial-gradient(circle at 90% 80%, rgba(8, 18, 12, 0.3) 0%, transparent 60%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Decorative Gold Top Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #c9a07c, #d8b08b, #c9a07c, transparent)",
        }}
      />

      {/* Gold Diamond Accent */}
      <div
        style={{
          position: "absolute",
          top: -4,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: "8px",
          height: "8px",
          background: "#c9a07c",
          opacity: 0.6,
        }}
      />

      {/* Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(0px)",
          border: "1px solid rgba(201, 160, 124, 0.2)",
          padding: "52px 44px",
          position: "relative",
          transition: "all 0.3s ease",
          animation: "fadeInUp 0.6s ease-out",
        }}
      >
        {/* Gold Corner Accents */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40px",
            height: "40px",
            borderTop: "2px solid rgba(201, 160, 124, 0.4)",
            borderLeft: "2px solid rgba(201, 160, 124, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40px",
            height: "40px",
            borderTop: "2px solid rgba(201, 160, 124, 0.4)",
            borderRight: "2px solid rgba(201, 160, 124, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "40px",
            height: "40px",
            borderBottom: "2px solid rgba(201, 160, 124, 0.4)",
            borderLeft: "2px solid rgba(201, 160, 124, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "40px",
            height: "40px",
            borderBottom: "2px solid rgba(201, 160, 124, 0.4)",
            borderRight: "2px solid rgba(201, 160, 124, 0.4)",
          }}
        />

        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              width: "50px",
              height: "1px",
              background: "#c9a07c",
              margin: "0 auto 24px auto",
              opacity: 0.4,
            }}
          />

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(36px, 8vw, 44px)",
              fontWeight: "400",
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: "-0.01em",
            }}
          >
            AnjisJewel
            <span style={{ color: "#c9a07c", fontStyle: "italic" }}>
              
            </span>
          </p>

          <div
            style={{
              width: "40px",
              height: "1px",
              background: "#c9a07c",
              margin: "16px auto 12px auto",
              opacity: 0.3,
            }}
          />

          <p
            style={{
              fontFamily: "Jost, sans-serif",
              fontSize: "9px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.35)",
              margin: 0,
            }}
          >
            Admin Access
          </p>

          <div
            style={{
              width: "30px",
              height: "1px",
              background: "#c9a07c",
              margin: "20px auto 0 auto",
              opacity: 0.2,
            }}
          />
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* EMAIL FIELD */}
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "Jost, sans-serif",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.45)",
                marginBottom: "12px",
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              placeholder="admin@anjisjewel.com"
              style={{
                width: "100%",
                padding: "14px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontFamily: "Jost, sans-serif",
                fontSize: "14px",
                fontWeight: "350",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = "#c9a07c";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.value) {
                  e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
            />
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "Jost, sans-serif",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.45)",
                marginBottom: "12px",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "14px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontFamily: "Jost, sans-serif",
                fontSize: "14px",
                fontWeight: "350",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = "#c9a07c";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.value) {
                  e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              style={{
                marginTop: "8px",
                padding: "12px 16px",
                background: "rgba(220, 53, 69, 0.08)",
                borderLeft: "2px solid #c9a07c",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: "12px",
                  color: "#e08080",
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "12px",
              padding: "14px 24px",
              width: "100%",
              background: loading ? "rgba(201, 160, 124, 0.4)" : "#c9a07c",
              color: "#0d2818",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Jost, sans-serif",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#d8b08b";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#c9a07c";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid rgba(13, 40, 24, 0.2)",
                    borderTop: "2px solid #0d2818",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Verifying...
              </span>
            ) : (
              "Enter Admin Portal"
            )}
          </button>

          {/* Footer Decorative Line */}
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.3))",
                }}
              />
              <span
                style={{
                  width: "3px",
                  height: "3px",
                  background: "#c9a07c",
                  borderRadius: "50%",
                  opacity: 0.4,
                }}
              />
              <span
                style={{
                  width: "20px",
                  height: "1px",
                  background: "linear-gradient(90deg, rgba(201, 160, 124, 0.3), transparent)",
                }}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}