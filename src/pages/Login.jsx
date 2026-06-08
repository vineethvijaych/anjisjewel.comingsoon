import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | forgot | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useCart();

  // detect reset route
  useEffect(() => {
    if (location.pathname === "/reset-password") {
      setMode("reset");
    } else {
      setMode("login");
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (location.pathname === "/reset-password" && !data.session) {
        setError("Invalid or expired reset link");
      }
    };

    checkSession();
  }, [location.pathname]);

  // 🔐 LOGIN
  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    addToast("Welcome back!", "success");

    const redirectTo = location.state?.redirectTo || "/";

    navigate(redirectTo, { replace: true });
  };

  // 📧 FORGOT PASSWORD
  const sendReset = async () => {
    if (!email) {
      setError("Enter your email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    addToast("Reset link sent to email", "success");
  };

  // 🔁 RESET PASSWORD
  const updatePassword = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    addToast("Password updated!", "success");
    navigate("/login");
    setMode("login");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f1ec", // Ivory background
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
    }}>
      {/* Decorative Gold Top Line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100px",
        height: "2px",
        background: "linear-gradient(90deg, transparent, #c9a07c, #d8b08b, #c9a07c, transparent)",
      }} />

      {/* Gold Diamond Accent */}
      <div style={{
        position: "absolute",
        top: -4,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: "8px",
        height: "8px",
        background: "#c9a07c",
        opacity: 0.6,
      }} />

      {/* Main Card */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#ffffff",
        padding: "48px 40px",
        border: "1px solid rgba(201, 160, 124, 0.2)",
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
        animation: "fadeInUp 0.6s ease-out",
        position: "relative",
      }}>
        {/* Gold Corner Accents */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "40px",
          height: "40px",
          borderTop: "2px solid rgba(201, 160, 124, 0.3)",
          borderLeft: "2px solid rgba(201, 160, 124, 0.3)",
        }} />
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40px",
          height: "40px",
          borderTop: "2px solid rgba(201, 160, 124, 0.3)",
          borderRight: "2px solid rgba(201, 160, 124, 0.3)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "40px",
          height: "40px",
          borderBottom: "2px solid rgba(201, 160, 124, 0.3)",
          borderLeft: "2px solid rgba(201, 160, 124, 0.3)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "40px",
          height: "40px",
          borderBottom: "2px solid rgba(201, 160, 124, 0.3)",
          borderRight: "2px solid rgba(201, 160, 124, 0.3)",
        }} />

        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "40px",
            height: "1px",
            background: "#c9a07c",
            margin: "0 auto 24px auto",
            opacity: 0.4,
          }} />
          
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 8vw, 40px)",
            fontWeight: "400",
            color: "#0d2818",
            margin: "0 0 8px 0",
            letterSpacing: "-0.01em",
          }}>
            AnjisJewel
          </h1>
          
          <div style={{
            width: "30px",
            height: "1px",
            background: "#c9a07c",
            margin: "16px auto 0 auto",
            opacity: 0.3,
          }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(24px, 6vw, 28px)",
            fontWeight: "400",
            color: "#0d2818",
            margin: 0,
          }}>
            {mode === "login" && <>Welcome Back</>}
            {mode === "forgot" && <>Forgot <span style={{ color: "#c9a07c", fontStyle: "italic" }}>Password</span></>}
            {mode === "reset" && <>Reset <span style={{ color: "#c9a07c", fontStyle: "italic" }}>Password</span></>}
          </h2>
          <div style={{
            width: "50px",
            height: "1px",
            background: "#c9a07c",
            margin: "12px auto 0",
            opacity: 0.3,
          }} />
        </div>

        {/* Form */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
          {/* EMAIL (login + forgot) */}
          {(mode === "login" || mode === "forgot") && (
            <div>
              <label style={{
                display: "block",
                fontFamily: "Jost, sans-serif",
                fontSize: "10px",
                fontWeight: "600",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: "10px",
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  color: "#0d2818",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor = "#c9a07c";
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.value) {
                    e.currentTarget.style.borderBottomColor = "rgba(0, 0, 0, 0.1)";
                  }
                }}
              />
            </div>
          )}

          {/* PASSWORD (login + reset) */}
          {(mode === "login" || mode === "reset") && (
            <div>
              <label style={{
                display: "block",
                fontFamily: "Jost, sans-serif",
                fontSize: "10px",
                fontWeight: "600",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: "10px",
              }}>
                {mode === "login" ? "Password" : "New Password"}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  color: "#0d2818",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor = "#c9a07c";
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.value) {
                    e.currentTarget.style.borderBottomColor = "rgba(0, 0, 0, 0.1)";
                  }
                }}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "rgba(220, 53, 69, 0.05)",
              borderLeft: "2px solid #c9a07c",
            }}>
              <p style={{
                fontFamily: "Jost, sans-serif",
                fontSize: "12px",
                color: "#dc3545",
                margin: 0,
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={
              mode === "login"
                ? login
                : mode === "forgot"
                ? sendReset
                : updatePassword
            }
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 24px",
              marginTop: "8px",
              background: loading ? "rgba(201, 160, 124, 0.4)" : "#0d2818",
              color: "#ffffff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Jost, sans-serif",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#c9a07c";
                e.currentTarget.style.color = "#0d2818";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#0d2818";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #ffffff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Processing...
              </span>
            ) : (
              mode === "login"
                ? "Sign In"
                : mode === "forgot"
                ? "Send Reset Link"
                : "Update Password"
            )}
          </button>

          {/* Switch Links */}
          {mode === "login" && (
            <>
              <div style={{ textAlign: "right", marginTop: "-8px" }}>
                <span
                  onClick={() => setMode("forgot")}
                  style={{
                    fontFamily: "Jost, sans-serif",
                    fontSize: "11px",
                    color: "#c9a07c",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0d2818";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#c9a07c";
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <div style={{
                textAlign: "center",
                paddingTop: "16px",
                borderTop: "1px solid rgba(201, 160, 124, 0.15)",
                marginTop: "8px",
              }}>
                <p style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: "12px",
                  color: "#888",
                  margin: 0,
                }}>
                  New here?{" "}
                  <Link to="/register" style={{
                    color: "#c9a07c",
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0d2818";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#c9a07c";
                  }}>
                    Create an account
                  </Link>
                </p>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <div style={{
              textAlign: "center",
              paddingTop: "16px",
              borderTop: "1px solid rgba(201, 160, 124, 0.15)",
              marginTop: "8px",
            }}>
              <p style={{
                fontFamily: "Jost, sans-serif",
                fontSize: "12px",
                color: "#888",
                margin: 0,
              }}>
                <span
                  onClick={() => setMode("login")}
                  style={{
                    color: "#c9a07c",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0d2818";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#c9a07c";
                  }}
                >
                  ← Back to Login
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Bottom Decorative Line */}
        <div style={{
          marginTop: "32px",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              width: "20px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.3))",
            }} />
            <span style={{
              width: "3px",
              height: "3px",
              background: "#c9a07c",
              borderRadius: "50%",
              opacity: 0.4,
            }} />
            <span style={{
              width: "20px",
              height: "1px",
              background: "linear-gradient(90deg, rgba(201, 160, 124, 0.3), transparent)",
            }} />
          </div>
        </div>
      </div>

      {/* Animations */}
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