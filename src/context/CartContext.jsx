import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchCartCount = useCallback(async (currentUser) => {
    const u = currentUser ?? user;
    if (!u) { setCartCount(0); return; }
    const { data } = await supabase
      .from("cart")
      .select("quantity")
      .eq("user_id", u.id);
    const total = data?.reduce((sum, row) => sum + (row.quantity || 1), 0) || 0;
    setCartCount(total);
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCartCount(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchCartCount(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const iconMap = { error: "✕", success: "✓", info: "ℹ" };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount: () => fetchCartCount(), user, addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{iconMap[t.type] || "✓"}</span>
            <span className="toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);