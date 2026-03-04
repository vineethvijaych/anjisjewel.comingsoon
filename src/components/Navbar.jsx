import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "vineethcpz6881@gmail.com"; // ← replace with your email

export default function Navbar() {
  const { cartCount, user, addToast } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast("Signed out successfully", "success");
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="logo">Anjis<span>Jewel</span></Link>

        <nav className="nav-links">
          <a href="/#products">Collections</a>
          <a href="/#craft">Craft</a>
          {user && <Link to="/orders">My Orders</Link>}
          {user?.email === ADMIN_EMAIL && <Link to="/admin/orders">Admin</Link>}
        </nav>

        <div className="nav-right">
          {user ? (
            <button className="nav-auth-btn" onClick={handleLogout}>Sign Out</button>
          ) : (
            <Link to="/login" className="nav-auth-btn">Sign In</Link>
          )}
          <Link to="/cart" className="cart-btn">
            <span>✦</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}