import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import CartBar from "./components/CartBar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CartBar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/cart"          element={<Cart />} />
        <Route path="/success"       element={<Success />} />
        <Route path="/orders"        element={<Orders />} />
        <Route path="/admin/orders"  element={<AdminOrders />} />
      </Routes>
    </BrowserRouter>
  );
}