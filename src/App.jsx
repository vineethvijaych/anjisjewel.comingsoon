import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import AdminLogin from "./pages/AdminLogin";
import ProductDetail from "./pages/ProductDetail";
import CartBar from "./components/CartBar";

import MaintenanceOverlay from "./components/MaintenanceOverlay";

import { trackPage } from "./analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPage(location.pathname);
  }, [location]);

  return null;
}

function Shell() {
  const location = useLocation();

  const isAdmin =
    location.pathname.startsWith(
      "/admin"
    );

  const isAuthPage =
    location.pathname ===
      "/login" ||
    location.pathname ===
      "/reset-password";

  return (
    <>
      <AnalyticsTracker />

      {/* WEBSITE CONTENT */}
      <div
        style={{
          // filter:
          //   "blur(10px) brightness(.6)",
          // pointerEvents: "none",
          // userSelect: "none",
          minHeight: "100vh",
        }}
      >
        {!isAdmin &&
          !isAuthPage && (
            <Navbar />
          )}

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/success"
            element={<Success />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/product/:id"
            element={
              <ProductDetail />
            }
          />

          <Route
            path="/admin/xk9q2"
            element={
              <AdminLogin />
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminOrders />
            }
          />

          <Route
            path="/reset-password"
            element={<Login />}
          />
        </Routes>

        {!isAdmin &&
          !isAuthPage && (
            <CartBar />
          )}
      </div>

      {/* MAINTENANCE OVERLAY */}
      <MaintenanceOverlay />
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