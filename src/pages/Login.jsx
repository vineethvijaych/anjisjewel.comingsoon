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
    navigate("/");
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
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <div className="auth-visual-logo">
            Anjis<span>Jewel</span>
          </div>
          <p className="auth-visual-tagline">
            Where elegance meets artistry
          </p>
          <div className="auth-visual-diamond" />
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          {/* TITLE */}
          <h1 className="auth-title">
            {mode === "login" && <>Welcome <em style={{ color: "var(--gold)" }}>Back</em></>}
            {mode === "forgot" && <>Forgot <em style={{ color: "var(--gold)" }}>Password</em></>}
            {mode === "reset" && <>Reset <em style={{ color: "var(--gold)" }}>Password</em></>}
          </h1>

          {/* EMAIL (login + forgot) */}
          {(mode === "login" || mode === "forgot") && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* PASSWORD */}
          {(mode === "login" || mode === "reset") && (
            <div className="form-group">
              <label className="form-label">
                {mode === "login" ? "Password" : "New Password"}
              </label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          {/* BUTTON */}
          <button
            className="form-submit-btn"
            onClick={
              mode === "login"
                ? login
                : mode === "forgot"
                ? sendReset
                : updatePassword
            }
            disabled={loading}
          >
            <span>
              {loading
                ? "Processing…"
                : mode === "login"
                ? "Sign In"
                : mode === "forgot"
                ? "Send Reset Link"
                : "Update Password"}
            </span>
          </button>

          {/* SWITCH LINKS */}
          {mode === "login" && (
            <>
              <p style={{ textAlign: "right", marginTop: 6 }}>
                <span
                  onClick={() => setMode("forgot")}
                  style={{ fontSize: 12, color: "var(--gold)", cursor: "pointer" }}
                >
                  Forgot Password?
                </span>
              </p>

              <p className="auth-switch">
                New here? <Link to="/register">Create an account</Link>
              </p>
            </>
          )}

          {mode === "forgot" && (
            <p className="auth-switch">
              <span
                onClick={() => setMode("login")}
                style={{ cursor: "pointer" }}
              >
                Back to Login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}