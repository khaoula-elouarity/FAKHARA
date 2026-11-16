import React, { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import SearchOverlay from "./SearchOverlay.jsx";
import "./Header.css";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(0);

  const closeMenu = () => setMenuOpen(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const handleCartPulse = () =>
      setCartPulse((value) => value + 1);
    const handleWishlistPulse = () =>
      setWishlistPulse((value) => value + 1);

    window.addEventListener("fakhara:cart-pulse", handleCartPulse);
    window.addEventListener("fakhara:wishlist-pulse", handleWishlistPulse);

    return () => {
      window.removeEventListener("fakhara:cart-pulse", handleCartPulse);
      window.removeEventListener(
        "fakhara:wishlist-pulse",
        handleWishlistPulse
      );
    };
  }, []);

  const searchLabels = {
    ar: "بحث",
    fr: "Rechercher",
    en: "Search",
  };

  const searchLabel = searchLabels[language] || searchLabels.en;

  const navItems = [
    { label: t.home, path: "/" },
    { label: t.collections, path: "/collections" },
    { label: t.about, path: "/about" },
    { label: t.contact, path: "/contact" },
  ];

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* Mobile menu */}
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? t.close : t.menu}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Brand logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <span className="brand-symbol">F</span>

          <span className="brand-name">
            FAKHARA
            <small>ART OF MOROCCAN POTTERY</small>
          </span>
        </Link>

        {/* Navigation */}
        <nav className={`main-navigation ${menuOpen ? "is-open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to="/customize"
            className="mobile-customize-link"
            onClick={closeMenu}
          >
            {t.customize}
          </Link>
        </nav>

        {/* Header actions */}
        <div className="header-actions">

          {/* Account */}
          <Link
            to={user ? "/account" : "/account/login"}
            className="header-icon-link account-link"
            aria-label={t.account}
            title={t.account}
            onClick={closeMenu}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="header-svg"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span className="account-link-label">{t.account}</span>
          </Link>

          {/* Search */}
          <button
            type="button"
            className="header-icon-link search-link"
            aria-label={searchLabel}
            title={searchLabel}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            onClick={() => {
              closeMenu();
              setSearchOpen(true);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="header-svg search-svg"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            key={`wishlist-${wishlistPulse}`}
            to="/wishlist"
            className={`header-icon-link wishlist-link ${
              wishlistPulse ? "is-pulsing" : ""
            }`}
            aria-label={t.wishlist}
            title={t.wishlist}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="header-svg"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
          </Link>

          {/* Shopping cart */}
          <Link
            key={`cart-${cartPulse}`}
            to="/cart"
            className={`header-icon-link cart-link ${
              cartPulse ? "is-pulsing" : ""
            }`}
            aria-label={t.cart}
            title={t.cart}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="header-svg cart-svg"
            >
              <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </Link>

          {/* Language selector */}
          <select
            className="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label={t.language}
          >
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>

        {/* Customize button */}
        <Link to="/customize" className="header-customize-button">
          {t.customize}
          <span>↗</span>
        </Link>

      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}