import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import AdminLogin from "./pages/AdminLogin";
import CartBar from "./components/CartBar";

// Hide navbar & cart bar on admin pages
function Shell() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartBar />}
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<Register />} />
        <Route path="/cart"               element={<Cart />} />
        <Route path="/success"            element={<Success />} />
        <Route path="/orders"             element={<Orders />} />

        {/* Secret admin routes — not linked anywhere */}
        <Route path="/admin/xk9q2"        element={<AdminLogin />} />
        <Route path="/admin/orders"       element={<AdminOrders />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}