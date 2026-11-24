import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  cartLineKey,
  getFeedback,
} from "../utils/storeFeedback.js";
import "./cart.css";

export default function Cart() {
  const { language } = useLanguage();
  const { products } = useStore();
  const { addToast } = useToast();
  const feedback = getFeedback(language);
  const pulseTimer = useRef(null);
  const quantityToastTimer = useRef(null);

  const [pulseId, setPulseId] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fakhara-cart") || "[]");
    } catch {
      return [];
    }
  });

  const text = {
    ar: {
      title: "سلة المشتريات",
      subtitle: "اختاري قطعك الفخارية المفضلة",
      empty: "سلتك فارغة حالياً",
      discover: "اكتشفي مجموعاتنا",
      quantity: "الكمية",
      remove: "حذف",
      subtotal: "المجموع",
      delivery: "التوصيل",
      later: "يحدد حسب المدينة",
      total: "المجموع الإجمالي",
      continue: "متابعة التسوق",
      checkout: "إتمام الطلب",
      currency: "درهم",
    },
    fr: {
      title: "Votre panier",
      subtitle: "Retrouvez vos pièces préférées",
      empty: "Votre panier est vide",
      discover: "Découvrir nos collections",
      quantity: "Quantité",
      remove: "Supprimer",
      subtotal: "Sous-total",
      delivery: "Livraison",
      later: "Selon la ville",
      total: "Total",
      continue: "Continuer vos achats",
      checkout: "Passer la commande",
      currency: "DH",
    },
    en: {
      title: "Shopping Cart",
      subtitle: "Your favorite pottery pieces",
      empty: "Your cart is currently empty",
      discover: "Discover our collections",
      quantity: "Quantity",
      remove: "Remove",
      subtotal: "Subtotal",
      delivery: "Delivery",
      later: "Calculated by city",
      total: "Total",
      continue: "Continue shopping",
      checkout: "Proceed to checkout",
      currency: "MAD",
    },
  };

  const t = text[language] || text.en;

  useEffect(() => {
    localStorage.setItem("fakhara-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    return () => {
      if (pulseTimer.current) {
        clearTimeout(pulseTimer.current);
      }
      if (quantityToastTimer.current) {
        clearTimeout(quantityToastTimer.current);
      }
    };
  }, []);

  const cartProducts = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);

      if (!product) {
        return null;
      }

      const variant = (product.images || []).find(
        (entry) => entry.key === item.variantKey
      );
      const lineKey = cartLineKey(item);

      return {
        ...product,
        quantity: item.quantity,
        lineKey,
        variantKey: item.variantKey || "",
        displayImage: variant?.image || product.image,
        displayName: variant
          ? `${product.name[language] || product.name.en} - ${
              variant.name?.[language] || variant.name?.en || ""
            }`
          : product.name[language] || product.name.en,
        unitPrice:
          variant?.price !== null && variant?.price !== undefined
            ? variant.price
            : product.price,
      };
    })
    .filter(Boolean);

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  function updateQuantity(lineKey, amount) {
    setCart((current) =>
      current
        .map((item) =>
          cartLineKey(item) === lineKey
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
    );

    setPulseId(lineKey);
    if (pulseTimer.current) {
      clearTimeout(pulseTimer.current);
    }
    pulseTimer.current = setTimeout(() => setPulseId(null), 600);

    if (quantityToastTimer.current) {
      clearTimeout(quantityToastTimer.current);
    }
    quantityToastTimer.current = setTimeout(() => {
      addToast({ type: "info", message: feedback.cartUpdated });
    }, 320);
  }

  function removeProduct(lineKey) {
    const index = cart.findIndex(
      (item) => cartLineKey(item) === lineKey
    );
    const removed = cart[index];

    if (!removed) {
      return;
    }

    setRemovingIds((current) => [...current, lineKey]);

    setTimeout(() => {
      setCart((current) =>
        current.filter((item) => cartLineKey(item) !== lineKey)
      );
      setRemovingIds((current) =>
        current.filter((item) => item !== lineKey)
      );

      addToast({
        type: "info",
        message: feedback.cartRemoved,
        action: {
          label: feedback.undo,
          onClick: () => {
            setCart((current) => {
              if (current.some((item) => cartLineKey(item) === lineKey)) {
                return current;
              }
              const restored = [...current];
              restored.splice(Math.min(index, restored.length), 0, removed);
              return restored;
            });
          },
        },
      });
    }, 280);
  }

  return (
    <main className="cart-page">
      <section className="cart-banner">
        <span>FAKHARA</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <div className="cart-container">
        {cartProducts.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-symbol">F</div>
            <h2>{t.empty}</h2>
            <Link to="/" className="cart-primary-button">
              {t.discover}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cartProducts.map((product) => (
                <article
                  className={`cart-item ${
                    removingIds.includes(product.lineKey) ? "is-removing" : ""
                  } ${pulseId === product.lineKey ? "is-updating" : ""}`}
                  key={product.lineKey}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="cart-item-image"
                  >
                    {product.displayImage ? (
                      <img
                        src={product.displayImage}
                        alt={product.displayName}
                      />
                    ) : (
                      <span>F</span>
                    )}
                  </Link>

                  <div className="cart-item-info">
                    <h2>{product.displayName}</h2>
                    <p>
                      {product.unitPrice} {t.currency}
                    </p>

                    <div className="cart-item-actions">
                      <div className="cart-quantity">
                        <button
                          onClick={() =>
                            updateQuantity(product.lineKey, -1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{product.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(product.lineKey, 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove"
                        onClick={() => removeProduct(product.lineKey)}
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item-total">
                    {product.unitPrice * product.quantity} {t.currency}
                  </strong>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <h2>{t.title}</h2>

              <div className="cart-summary-row">
                <span>{t.subtotal}</span>
                <strong>{subtotal} {t.currency}</strong>
              </div>

              <div className="cart-summary-row">
                <span>{t.delivery}</span>
                <span>{t.later}</span>
              </div>

              <div className="cart-summary-total">
                <span>{t.total}</span>
                <strong>{subtotal} {t.currency}</strong>
              </div>

              <Link to="/checkout" className="cart-primary-button">
                {t.checkout}
              </Link>

              <Link to="/" className="cart-continue-link">
                {t.continue}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}