import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { cartCount, user, addToast } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    addToast("Signed out successfully", "success");

    navigate("/");
  };

  const handleNav = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;

          height: 82px;

          z-index: 1000;

          background: rgba(8, 18, 12, 0.78);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          border-bottom: 1px solid rgba(201, 160, 124, 0.08);

          transition: all .3s ease;
        }

        .navbar.scrolled {
          height: 74px;

          background: rgba(8, 18, 12, 0.92);

          border-bottom: 1px solid rgba(201, 160, 124, 0.12);
        }

        .nav-container {
          max-width: 1440px;
          height: 100%;

          margin: 0 auto;
          padding: 0 40px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          position: relative;
        }

        .logo {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          
          display: flex;
          align-items: center;
          justify-content: center;

          color: #f6f2ea;
          text-decoration: none;

          font-family: "Cormorant Garamond", serif;
          font-size: 34px;
          font-weight: 500;

          letter-spacing: 4px;
          line-height: 1;

          white-space: nowrap;

          transition: .3s ease;
        }

        .logo:hover {
          color: #d8b08b;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-shrink: 0;
        }

        .nav-left a,
        .nav-auth-btn,
        .cart-btn {
          color: rgba(246, 242, 234, .82);

          text-decoration: none;

          font-family: "Jost", sans-serif;
          font-size: 11px;

          letter-spacing: 2.4px;
          text-transform: uppercase;

          background: transparent;
          border: none;

          cursor: pointer;

          transition: .3s ease;
        }

        .nav-left a:hover,
        .nav-auth-btn:hover,
        .cart-btn:hover {
          color: #d8b08b;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-shrink: 0;
        }

        .cart-btn {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cart-badge {
          width: 18px;
          height: 18px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #c9a07c;
          color: #08120c;

          font-size: 10px;
          font-weight: 600;
        }

        .hamburger {
          display: none;
        }

        .mobile-menu {
          position: fixed;

          top: 82px;
          left: 0;

          width: 100%;

          background: #08120c;

          border-top: 1px solid rgba(201,160,124,.1);

          display: flex;
          flex-direction: column;

          gap: 24px;

          padding: 30px 24px;

          opacity: 0;
          visibility: hidden;

          transform: translateY(-20px);

          transition: .3s ease;

          z-index: 999;
        }

        .navbar.scrolled + .mobile-menu,
        .navbar.scrolled ~ .mobile-menu {
          top: 74px;
        }

        .mobile-menu.open {
          opacity: 1;
          visibility: visible;

          transform: translateY(0);
        }

        .mobile-menu a,
        .mobile-auth-btn {
          color: #f6f2ea;

          text-decoration: none;

          font-family: "Jost", sans-serif;

          font-size: 13px;

          letter-spacing: 2px;

          text-transform: uppercase;

          background: transparent;
          border: none;

          text-align: left;

          cursor: pointer;
        }

        .mobile-menu-divider {
          width: 100%;
          height: 1px;

          background: rgba(201,160,124,.15);
        }

        @media (max-width: 992px) {
          .navbar {
            height: 72px;
          }

          .navbar.scrolled {
            height: 68px;
          }

          .nav-container {
            padding: 0 18px;
          }

          .nav-left {
            display: none;
          }

          .logo {
            position: relative;
            left: 0;
            transform: none;
            
            font-size: 20px;
            letter-spacing: 2px;
          }

          .nav-auth-desktop {
            display: none;
          }

          .nav-right {
            gap: 16px;
          }

          .cart-badge {
            width: 16px;
            height: 16px;
            font-size: 9px;
          }

          .hamburger {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
          }

          .hamburger span {
            width: 20px;
            height: 1.5px;
            background: #f6f2ea;
          }

          .mobile-menu {
            top: 72px;
          }
          
          .navbar.scrolled ~ .mobile-menu,
          .navbar.scrolled + .mobile-menu {
            top: 68px;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 16px;
          }
          
          .logo {
            font-size: 18px;
            letter-spacing: 1.5px;
          }
          
          .nav-right {
            gap: 14px;
          }
        }
      `}</style>

      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <nav className="nav-left">
            <a href="/#products">Collections</a>
            <a href="/#craft">Craft</a>
            {user && <Link to="/orders">Orders</Link>}
          </nav>

          <Link to="/" className="logo" style={{ padding: "20px 0 0 0" }} onClick={handleNav}>
            ANJIS JEWEL
          </Link>

          <div className="nav-right">
            <div className="nav-auth-desktop">
              {user ? (
                <button
                  className="nav-auth-btn"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/login" className="nav-auth-btn">
                  Account
                </Link>
              )}
            </div>

            <Link to="/cart" className="cart-btn">
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="hamburger"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="/#products" onClick={handleNav}>
          Collections
        </a>

        <a href="/#craft" onClick={handleNav}>
          Craft
        </a>

        {user && (
          <Link to="/orders" onClick={handleNav}>
            My Orders
          </Link>
        )}

        <div className="mobile-menu-divider" />

        {user ? (
          <button
            className="mobile-auth-btn"
            onClick={() => {
              handleLogout();
              handleNav();
            }}
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/login"
            className="mobile-auth-btn"
            onClick={handleNav}
          >
            Sign In
          </Link>
        )}
      </div>
    </>
  );
}