import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useCart();

  const register = async () => {
    setError("");
    if (!email || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    addToast("Account created! Please check your email.", "success");
    navigate("/login");
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
            Join our circle of discerning<br />collectors and connoisseurs
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <h1 className="auth-title">Create<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Account</em></h1>
          <p className="auth-subtitle">Begin your journey with us</p>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && register()}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="form-submit-btn" onClick={register} disabled={loading}>
            <span>{loading ? "Creating Account…" : "Create Account"}</span>
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
