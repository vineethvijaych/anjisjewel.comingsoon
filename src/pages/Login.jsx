import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useCart();

  const login = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    addToast("Welcome back!", "success");
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <div className="auth-visual-logo">Anjis<span>Jewel</span></div>
          <p className="auth-visual-tagline">Where elegance meets artistry</p>
          <div className="auth-visual-diamond" />
          <p style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--ash)", lineHeight: 1.8 }}>
            Sign in to access your curated<br />collection and exclusive offers
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <h1 className="auth-title">Welcome<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Back</em></h1>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="form-submit-btn" onClick={login} disabled={loading}>
            <span>{loading ? "Signing in…" : "Sign In"}</span>
          </button>

          <p className="auth-switch">
            New to AnjisJewel? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
