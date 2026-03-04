import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "vineethcpz6881@gmail.com";

export default function Navbar() {

  const { cartCount, user, addToast } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) setScrolled(true);
      else setScrolled(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      addToast("Logout failed", "error");
      return;
    }

    addToast("Signed out successfully", "success");
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>

      <div className="nav-container">

        <Link to="/" className="logo">Anjis<span>Jewel</span></Link>

        <nav className="nav-links nav-links-desktop">
          <Link to="/#products">Collections</Link>
          <Link to="/#craft">Craft</Link>
          {user && <Link to="/orders">My Orders</Link>}
          {user?.email === ADMIN_EMAIL && <Link to="/admin/orders">Admin</Link>}
        </nav>

        <div className="nav-right">

          <div className="nav-auth-desktop">
            {user ? (
              <button className="nav-auth-btn" onClick={handleLogout}>
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="nav-auth-btn">
                Sign In
              </Link>
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
          >
            <span /><span /><span />
          </button>

        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/#products">Collections</Link>
        <Link to="/#craft">Craft</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user?.email === ADMIN_EMAIL && <Link to="/admin/orders">Admin</Link>}

        <div className="mobile-menu-divider" />

        {user ? (
          <button className="mobile-auth-btn" onClick={handleLogout}>
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="mobile-auth-btn">
            Sign In
          </Link>
        )}
      </div>

    </header>
  );
}