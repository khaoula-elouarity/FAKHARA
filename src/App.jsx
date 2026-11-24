import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/footer.jsx";
import Loading from "./components/Loading.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

import Home from "./components/home.jsx";
import Collection from "./components/collection.jsx";
import Collections from "./components/Collections.jsx";
import ProductDetails from "./components/productdetails.jsx";
import DiscoveryPage from "./components/DiscoveryPage.jsx";
import Cart from "./components/cart.jsx";
import Wishlist from "./components/wishlist.jsx";
import Checkout from "./components/checkout.jsx";
import TrackOrder from "./components/TrackOrder.jsx";
import About from "./components/About.jsx";
import Contact from "./components/contact.jsx";
import ProductSearch from "./components/ProductSearch.jsx";
import AdminDashboard from "./components/admindashboard.jsx";
import Account from "./components/account/Account.jsx";
import RequireAuth from "./components/account/RequireAuth.jsx";
import {
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
} from "./components/account/AccountAuth.jsx";

import "./App.css";

function NotFound() {
  return (
    <main className="temporary-page">
      <h1>404</h1>
      <p>Page not found</p>
    </main>
  );
}

export default function App() {
  return (
    <div className="app">
      <Loading />

      <Header />

      <ScrollToTop />

      <WhatsAppButton />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:category" element={<Collection />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/discover/:itemId" element={<DiscoveryPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/search" element={<ProductSearch />} />
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/register" element={<Register />} />
        <Route
          path="/account/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/account/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route path="/admin/login" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminDashboard />} />
        <Route path="/admin/messages" element={<AdminDashboard />} />
        <Route path="/admin/customizations" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminDashboard />} />
        <Route path="/admin/featured-section" element={<AdminDashboard />} />
        <Route path="/admin/discovery-pages" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
