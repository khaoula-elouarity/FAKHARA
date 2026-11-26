import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { localizedContent } from "../utils/localizedContent.js";
import { searchProducts } from "../services/api.js";
import ProductRating from "./ProductRating.jsx";
import "./ProductSearch.css";

const content = {
  ar: {
    title: "اكتشف قطعك المفضلة",
    description: "ابحث عن قطعة فخارية تناسب ذوقك.",
    search: "اكتب اسم المنتوج...",
    category: "جميع المجموعات",
    min: "أقل ثمن",
    max: "أعلى ثمن",
    sort: "ترتيب حسب",
    default: "الترتيب الافتراضي",
    low: "الثمن: من الأقل للأعلى",
    high: "الثمن: من الأعلى للأقل",
    results: "عدد النتائج",
    loading: "جاري البحث...",
    empty: "لم نعثر على منتجات.",
    emptyHint: "جربي البحث بكلمات أخرى أو تصفح إحدى المجموعات.",
    error: "تعذر إتمام البحث. يرجى المحاولة مرة أخرى.",
    details: "اكتشف المنتوج",
    currency: "درهم",
    productFallback: "منتوج",
  },
  fr: {
    title: "Découvrez vos pièces préférées",
    description: "Trouvez une création en poterie qui vous correspond.",
    search: "Rechercher un produit...",
    category: "Toutes les collections",
    min: "Prix minimum",
    max: "Prix maximum",
    sort: "Trier par",
    default: "Ordre par défaut",
    low: "Prix croissant",
    high: "Prix décroissant",
    results: "Nombre de résultats",
    loading: "Recherche en cours...",
    empty: "Aucun produit trouvé.",
    emptyHint:
      "Essayez avec d'autres mots ou parcourez une collection.",
    error:
      "La recherche n'a pas pu aboutir. Veuillez réessayer.",
    details: "Découvrir le produit",
    currency: "DH",
    productFallback: "Produit",
  },
  en: {
    title: "Discover your favorite pieces",
    description: "Find a pottery creation that matches your taste.",
    search: "Search for a product...",
    category: "All collections",
    min: "Minimum price",
    max: "Maximum price",
    sort: "Sort by",
    default: "Default order",
    low: "Price: low to high",
    high: "Price: high to low",
    results: "Number of results",
    loading: "Searching...",
    empty: "No products found.",
    emptyHint:
      "Try different keywords or explore one of our collections.",
    error: "We couldn't complete your search. Please try again.",
    details: "Discover product",
    currency: "MAD",
    productFallback: "Product",
  },
};

function productName(product, language, fallback) {
  return localizedContent(product?.name, language, fallback);
}

function categoryName(category, language) {
  return localizedContent(category?.name, language, category?.slug || "");
}

export default function ProductSearch() {
  const { language } = useLanguage();
  const { products, categories } = useStore();
  const t = content[language] || content.en;

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("default");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const trimmedSearch = deferredSearch.trim();

  useEffect(() => {
    if (!trimmedSearch) {
      setSearchResults([]);
      setSearching(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    setSearchResults([]);
    setSearching(true);
    setSearchError(false);

    const timer = window.setTimeout(async () => {
      try {
        const payload = await searchProducts(
          trimmedSearch,
          { limit: 50 },
          { signal: controller.signal }
        );

        setSearchResults(
          Array.isArray(payload?.products) ? payload.products : []
        );
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setSearchResults([]);
        setSearchError(true);
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedSearch]);

  const sourceProducts = trimmedSearch ? searchResults : products;

  const filteredProducts = useMemo(() => {
    let result = sourceProducts.filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesMin =
        minPrice === "" || product.price >= Number(minPrice);
      const matchesMax =
        maxPrice === "" || product.price <= Number(maxPrice);

      return matchesCategory && matchesMin && matchesMax;
    });

    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [sourceProducts, category, minPrice, maxPrice, sort]);

  const showLoading = Boolean(trimmedSearch) && searching;

  return (
    <main className="product-search-page">
      <section className="product-search-heading">
        <span>FAKHARA COLLECTIONS</span>
        <h1>{t.title}</h1>
        <p>{t.description}</p>
      </section>

      <section className="product-search-container">
        <div className="product-search-filters">
          <input
            type="search"
            className="product-search-input"
            placeholder={t.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label={t.search}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label={t.category}
          >
            <option value="all">{t.category}</option>
            {categories.map((item) => (
              <option
                value={item.id || item.slug}
                key={item.id || item.slug}
              >
                {categoryName(item, language)}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder={t.min}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            aria-label={t.min}
          />

          <input
            type="number"
            min="0"
            placeholder={t.max}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            aria-label={t.max}
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label={t.sort}
          >
            <option value="default">{t.default}</option>
            <option value="low">{t.low}</option>
            <option value="high">{t.high}</option>
          </select>
        </div>

        <p
          className="product-search-count"
          role="status"
          aria-live="polite"
        >
          {showLoading
            ? t.loading
            : `${t.results}: ${filteredProducts.length}`}
        </p>

        {showLoading ? (
          <div className="product-search-empty">
            <span className="product-search-spinner" aria-hidden="true" />
            <p>{t.loading}</p>
          </div>
        ) : searchError ? (
          <div className="product-search-empty" role="alert">
            <span>!</span>
            <p>{t.error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-search-grid">
            {filteredProducts.map((product) => {
              const name = productName(
                product,
                language,
                t.productFallback
              );
              const image =
                product.image ||
                product.galleryImages?.find(Boolean) ||
                product.images?.map((variant) => variant.image).find(Boolean);

              return (
                <article className="search-product-card" key={product.id}>
                  <Link to={`/product/${product.id}`}>
                    <div className="search-product-image">
                      <span>FAKHARA</span>
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  </Link>

                  <div className="search-product-info">
                    <h3>{name}</h3>
                    <div className="search-product-rating">
                      <ProductRating
                        productId={product.id}
                        variant="compact"
                      />
                    </div>
                    <p>
                      {product.price} {t.currency}
                    </p>
                    <Link to={`/product/${product.id}`}>
                      {t.details} →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="product-search-empty">
            <span>✧</span>
            <p>{t.empty}</p>
            <small>{t.emptyHint}</small>
          </div>
        )}
      </section>
    </main>
  );
}
