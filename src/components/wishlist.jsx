import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  addProductToCart,
  getFeedback,
} from "../utils/storeFeedback.js";
import "./Wishlist.css";

export default function Wishlist() {
  const { language } = useLanguage();
  const { products, favorites, loading, toggleFavorite } = useStore();
  const { addToast } = useToast();
  const feedback = getFeedback(language);

  const labels = {
    ar: {
      title: "قائمة المفضلة",
      subtitle: "احتفظي بقطعك الفخارية المفضلة",
      empty: "لم تضيفي أي منتج إلى المفضلة بعد",
      discover: "اكتشفي مجموعاتنا",
      remove: "إزالة",
      details: "اكتشفي المنتج",
      currency: "درهم",
    },
    fr: {
      title: "Ma liste de favoris",
      subtitle: "Retrouvez vos pièces préférées",
      empty: "Votre liste de favoris est vide",
      discover: "Découvrir nos collections",
      remove: "Supprimer",
      details: "Découvrir",
      currency: "DH",
    },
    en: {
      title: "My Wishlist",
      subtitle: "Keep your favorite pottery pieces",
      empty: "You haven't saved any products yet",
      discover: "Discover our collections",
      remove: "Remove",
      details: "Discover",
      currency: "MAD",
    },
  };

  const t = labels[language] || labels.en;

  const savedProducts = favorites
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  async function removeFromWishlist(id) {
    try {
      await toggleFavorite(id);
      addToast({ type: "success", message: feedback.wishlistRemoved });
    } catch {
      addToast({ type: "error", message: feedback.cartError });
    }
  }

  function addToCart(product) {
    try {
      addProductToCart(product.id, 1);
      addToast({
        type: "success",
        message: feedback.cartAdded,
        image: product.image || undefined,
      });
    } catch {
      addToast({ type: "error", message: feedback.cartError });
    }
  }

  return (
    <main className="wishlist-page">
      <section className="wishlist-banner">
        <span>FAKHARA</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <section className="wishlist-container">
        {loading && savedProducts.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-symbol">F</div>
            <h2>FAKHARA</h2>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-symbol">♡</div>
            <h2>{t.empty}</h2>
            <Link to="/" className="wishlist-main-button">
              {t.discover}
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {savedProducts.map((product) => (
              <article className="wishlist-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-image"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name[language] || product.name.en}
                    />
                  ) : (
                    <span>F</span>
                  )}
                </Link>

                <div className="wishlist-card-info">
                  <h2>{product.name[language] || product.name.en}</h2>

                  <strong>
                    {product.price} {t.currency}
                  </strong>

                  <div className="wishlist-card-actions">
                    <button onClick={() => addToCart(product)}>
                      {language === "ar"
                        ? "أضيفي للسلة"
                        : language === "fr"
                          ? "Ajouter au panier"
                          : "Add to cart"}
                    </button>

                    <button
                      className="wishlist-remove"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      {t.remove}
                    </button>
                  </div>

                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-details-link"
                  >
                    {t.details} ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}