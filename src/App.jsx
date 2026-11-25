import React, { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/footer.jsx";
import Loading from "./components/Loading.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import BackNavigation from "./components/BackNavigation.jsx";
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
import Account from "./components/account/Account.jsx";
import RequireAuth from "./components/account/RequireAuth.jsx";
import {
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
} from "./components/account/AccountAuth.jsx";
import { adminMe } from "./services/api.js";

import "./App.css";

const AdminDashboard = lazy(() => import("./components/admindashboard.jsx"));

function NotFound() {
  return (
    <main className="temporary-page">
      <h1>404</h1>
      <p>Page not found</p>
    </main>
  );
}

function AdminGate({ children }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    adminMe()
      .then(() => {
        if (active) {
          setAllowed(true);
          setChecked(true);
        }
      })
      .catch(() => {
        if (active) {
          setAllowed(false);
          setChecked(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!checked) return null;

  if (!allowed) {
    return <Navigate to="/account/login" replace />;
  }

  return children;
}

function AdminRoute() {
  return (
    <AdminGate>
      <Suspense fallback={null}>
        <AdminDashboard />
      </Suspense>
    </AdminGate>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="app">
      <Loading />

      <Header />

      <BackNavigation />

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
        <Route path="/admin/login" element={<AdminRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route
          path="/admin/customizations"
          element={<Navigate to="/admin" replace />}
        />
        <Route path="/admin/orders" element={<AdminRoute />} />
        <Route path="/admin/products" element={<AdminRoute />} />
        <Route path="/admin/categories" element={<AdminRoute />} />
        <Route path="/admin/messages" element={<AdminRoute />} />
        <Route path="/admin/customers" element={<AdminRoute />} />
        <Route path="/admin/homepage-content" element={<AdminRoute />} />
        <Route path="/admin/featured-section" element={<AdminRoute />} />
        <Route path="/admin/discovery-pages" element={<AdminRoute />} />
        <Route path="/admin/settings" element={<AdminRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
