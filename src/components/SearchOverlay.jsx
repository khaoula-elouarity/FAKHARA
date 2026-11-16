import React, {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { searchProducts } from "../services/api.js";
import "./SearchOverlay.css";

const content = {
  ar: {
    eyebrow: "البحث في فخارة",
    title: "ابحث عن قطعتك",
    search: "ابحث باسم المنتوج، مجموعة أو كلمة مفتاحية...",
    close: "إغلاق البحث",
    clear: "مسح البحث",
    hint: "اكتب اسم المنتوج، مجموعة أو كلمة مفتاحية.",
    collections: "تصفح المجموعات",
    loading: "جاري البحث...",
    empty: "لم نعثر على منتجات.",
    emptyHint: "جرب كلمة أخرى أو تصفح إحدى المجموعات.",
    error: "تعذر إتمام البحث. يرجى المحاولة مرة أخرى.",
    results: "النتائج",
    details: "عرض التفاصيل",
    currency: "درهم",
    productFallback: "منتوج",
    categoryFallback: "مجموعة",
  },
  fr: {
    eyebrow: "RECHERCHE FAKHARA",
    title: "Trouvez votre pièce",
    search:
      "Rechercher un produit, une collection ou un mot-clé...",
    close: "Fermer la recherche",
    clear: "Effacer la recherche",
    hint: "Saisissez un nom de produit, une collection ou un mot-clé.",
    collections: "Explorer les collections",
    loading: "Recherche en cours...",
    empty: "Aucun produit trouvé.",
    emptyHint:
      "Essayez un autre mot-clé ou parcourez une collection.",
    error:
      "La recherche n'a pas pu aboutir. Veuillez réessayer.",
    results: "Résultats",
    details: "Voir le produit",
    currency: "DH",
    productFallback: "Produit",
    categoryFallback: "Collection",
  },
  en: {
    eyebrow: "FAKHARA SEARCH",
    title: "Find your piece",
    search:
      "Search by product name, collection, or keyword...",
    close: "Close search",
    clear: "Clear search",
    hint: "Search by product name, collection, or keyword.",
    collections: "Explore collections",
    loading: "Searching...",
    empty: "No products found.",
    emptyHint:
      "Try another keyword or explore one of our collections.",
    error: "We couldn't complete your search. Please try again.",
    results: "Results",
    details: "View product",
    currency: "MAD",
    productFallback: "Product",
    categoryFallback: "Collection",
  },
};

function localizedProductName(product, language, fallback) {
  return (
    product?.name?.[language] ||
    product?.name?.en ||
    product?.name?.fr ||
    product?.name?.ar ||
    fallback
  );
}

function localizedCategoryName(product, language, fallback) {
  return (
    product?.categoryName?.[language] ||
    product?.categoryName?.en ||
    product?.categoryName?.fr ||
    product?.categoryName?.ar ||
    fallback
  );
}

function categoryLabel(category, language) {
  return (
    category?.name?.[language] ||
    category?.name?.en ||
    category?.name?.fr ||
    category?.name?.ar ||
    category?.slug ||
    ""
  );
}

export default function SearchOverlay({ open, onClose }) {
  const { language } = useLanguage();
  const { categories } = useStore();
  const t = content[language] || content.en;
  const titleId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setStatus("idle");
      return;
    }

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const search = query.trim();

    if (!search) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    const timer = window.setTimeout(async () => {
      try {
        const payload = await searchProducts(
          search,
          { limit: 8 },
          { signal: controller.signal }
        );

        setResults(Array.isArray(payload?.products) ? payload.products : []);
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setResults([]);
        setStatus("error");
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  if (!open) {
    return null;
  }

  const visibleCategories = categories
    .filter((category) => categoryLabel(category, language))
    .slice(0, 5);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="search-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="search-overlay-heading">
          <div>
            <span>{t.eyebrow}</span>
            <h2 id={titleId}>{t.title}</h2>
          </div>

          <button
            type="button"
            className="search-overlay-close"
            onClick={onClose}
            aria-label={t.close}
            title={t.close}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="search-overlay-input-row">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="search-overlay-input-icon"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              className="search-overlay-clear"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t.clear}
              title={t.clear}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>

        <div className="search-overlay-content">
          {status === "idle" && (
            <div className="search-overlay-idle">
              <p>{t.hint}</p>

              {visibleCategories.length > 0 && (
                <div className="search-overlay-suggestions">
                  <span>{t.collections}</span>
                  <div>
                    {visibleCategories.map((category) => {
                      const label = categoryLabel(category, language);

                      return (
                        <button
                          type="button"
                          key={category.id || category.slug}
                          onClick={() => setQuery(label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "loading" && (
            <div
              className="search-overlay-status"
              role="status"
              aria-live="polite"
            >
              <span className="search-overlay-spinner" aria-hidden="true" />
              <p>{t.loading}</p>
            </div>
          )}

          {status === "error" && (
            <div
              className="search-overlay-status search-overlay-error"
              role="alert"
            >
              <span aria-hidden="true">!</span>
              <p>{t.error}</p>
            </div>
          )}

          {status === "success" && results.length === 0 && (
            <div
              className="search-overlay-status search-overlay-empty"
              role="status"
            >
              <span aria-hidden="true">◇</span>
              <h3>{t.empty}</h3>
              <p>{t.emptyHint}</p>
            </div>
          )}

          {status === "success" && results.length > 0 && (
            <div className="search-overlay-results">
              <p className="search-overlay-results-count" role="status">
                {t.results} · {results.length}
              </p>

              <div className="search-overlay-results-grid">
                {results.map((product) => {
                  const productName = localizedProductName(
                    product,
                    language,
                    t.productFallback
                  );
                  const categoryName = localizedCategoryName(
                    product,
                    language,
                    t.categoryFallback
                  );

                  return (
                    <article
                      className="search-overlay-result"
                      key={product.id}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="search-overlay-result-image"
                        onClick={onClose}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <span>F</span>
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </Link>

                      <div className="search-overlay-result-info">
                        <span>{categoryName}</span>
                        <h3>{productName}</h3>
                        <div className="search-overlay-result-bottom">
                          <strong>
                            {product.price} {t.currency}
                          </strong>
                          <Link
                            to={`/product/${product.id}`}
                            onClick={onClose}
                          >
                            {t.details}
                            <span
                              className="search-overlay-result-arrow"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}
