import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { cartCount, user, addToast } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast("Signed out successfully", "success");
    navigate("/");
  };

  const handleNav = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="logo" onClick={handleNav}>
            Anjis<span>Jewel</span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links nav-links-desktop">
            <a href="/#products">Collections</a>
            <a href="/#craft">Craft</a>
            {user && <Link to="/orders">My Orders</Link>}

          </nav>

          <div className="nav-right">
            <div className="nav-auth-desktop">
              {user ? (
                <button className="nav-auth-btn" onClick={handleLogout}>Sign Out</button>
              ) : (
                <Link to="/login" className="nav-auth-btn">Sign In</Link>
              )}
            </div>
            <Link to="/cart" className="cart-btn">
              <span>✦</span>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — outside header so no border inheritance */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="/#products" onClick={handleNav}>Collections</a>
        <a href="/#craft"    onClick={handleNav}>Craft</a>
        {user && <Link to="/orders"       onClick={handleNav}>My Orders</Link>}

        <div className="mobile-menu-divider" />
        {user ? (
          <button className="mobile-auth-btn" onClick={() => { handleLogout(); handleNav(); }}>
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="mobile-auth-btn" onClick={handleNav}>
            Sign In
          </Link>
        )}
      </div>
    </>
  );
}