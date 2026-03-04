import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "vineethcpz6881@gmail.com";

export default function Navbar() {
  const { cartCount, user, addToast } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  const handleNav = () => setMenuOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast("Signed out successfully", "success");
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="logo" onClick={handleNav}>Anjis<span>Jewel</span></Link>

        {/* Desktop nav */}
        <nav className="nav-links nav-links-desktop">
          <a href="/#products" onClick={handleNav}>Collections</a>
          <a href="/#craft" onClick={handleNav}>Craft</a>
          {user && <Link to="/orders" onClick={handleNav}>My Orders</Link>}
          {user?.email === ADMIN_EMAIL && <Link to="/admin/orders" onClick={handleNav}>Admin</Link>}
        </nav>

        <div className="nav-right">
          {/* Desktop auth */}
          <div className="nav-auth-desktop">
            {user ? (
              <button className="nav-auth-btn" onClick={handleLogout}>Sign Out</button>
            ) : (
              <Link to="/login" className="nav-auth-btn" onClick={handleNav}>Sign In</Link>
            )}
          </div>

          <Link to="/cart" className="cart-btn" onClick={handleNav}>
            <span>✦</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Hamburger button */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="/#products" onClick={handleNav}>Collections</a>
        <a href="/#craft" onClick={handleNav}>Craft</a>
        {user && <Link to="/orders" onClick={handleNav}>My Orders</Link>}
        {user?.email === ADMIN_EMAIL && <Link to="/admin/orders" onClick={handleNav}>Admin</Link>}
        <div className="mobile-menu-divider" />
        {user ? (
          <button className="mobile-auth-btn" onClick={handleLogout}>Sign Out</button>
        ) : (
          <Link to="/login" className="mobile-auth-btn" onClick={handleNav}>Sign In</Link>
        )}
      </div>
    </header>
  );
}