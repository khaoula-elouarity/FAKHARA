import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addFavoriteRequest,
  fetchCategories,
  fetchFavorites,
  fetchProducts,
  fetchPublicSettings,
  removeFavoriteRequest,
} from "../services/api.js";
import { DEFAULT_WHATSAPP_NUMBER } from "../utils/whatsapp.js";

const StoreContext = createContext(null);
const WISHLIST_KEY = "fakhara-wishlist";

function readLocalWishlist() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(favorites) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(favorites));
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState(readLocalWishlist);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  });

  const loadCatalog = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const [productsPayload, categoriesPayload] = await Promise.all([
        fetchProducts({}, { signal }),
        fetchCategories({ signal }),
      ]);

      setProducts(productsPayload?.products || []);
      setCategories(categoriesPayload?.categories || []);
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.code || "request_failed");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadCatalog]);

  useEffect(() => {
    const controller = new AbortController();

    fetchFavorites({ signal: controller.signal })
      .then((payload) => {
        if (Array.isArray(payload?.favorites)) {
          setFavorites(payload.favorites);
          writeLocalWishlist(payload.favorites);
        }
      })
      .catch((favoriteError) => {
        if (favoriteError.name !== "AbortError") {
          setFavorites(readLocalWishlist());
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setFavoritesReady(true);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublicSettings({ signal: controller.signal })
      .then((payload) => {
        const settings = payload?.settings;

        if (settings) {
          setSiteSettings((current) => ({
            ...current,
            ...settings,
          }));
        }
      })
      .catch(() => {
        // The storefront keeps the default contact number if this optional
        // settings request fails; catalog loading is not affected.
      });

    return () => {
      controller.abort();
    };
  }, []);

  const toggleFavorite = useCallback(
    async (productId) => {
      const wasFavorite = favorites.includes(productId);
      const optimistic = wasFavorite
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      setFavorites(optimistic);
      writeLocalWishlist(optimistic);

      try {
        const payload = wasFavorite
          ? await removeFavoriteRequest(productId)
          : await addFavoriteRequest(productId);

        if (Array.isArray(payload?.favorites)) {
          setFavorites(payload.favorites);
          writeLocalWishlist(payload.favorites);
        }

        return !wasFavorite;
      } catch (favoriteError) {
        setFavorites(favorites);
        writeLocalWishlist(favorites);

        if (favoriteError.code === "network_error") {
          return !wasFavorite;
        }

        throw favoriteError;
      }
    },
    [favorites]
  );

  const reload = useCallback(() => loadCatalog(), [loadCatalog]);
  const setFeaturedSection = useCallback((featuredSection) => {
    setSiteSettings((current) => ({ ...current, featuredSection }));
  }, []);

  const reloadSettings = useCallback(async () => {
    const payload = await fetchPublicSettings();

    if (payload?.settings) {
      setSiteSettings((current) => ({
        ...current,
        ...payload.settings,
      }));
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      categories,
      favorites,
      favoritesReady,
      loading,
      error,
      reload,
      reloadSettings,
      setFeaturedSection,
      toggleFavorite,
      whatsappNumber:
        siteSettings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
      homepage: siteSettings?.homepage || null,
      featuredSection: siteSettings?.featuredSection || null,
      featuredItems: siteSettings?.featuredItems || [],
      discoveryPages: siteSettings?.discoveryPages || [],
      isFavorite: (productId) => favorites.includes(productId),
      getProduct: (productId) =>
        products.find((product) => product.id === productId) || null,
    }),
    [
      products,
      categories,
      favorites,
      favoritesReady,
      loading,
      error,
      reload,
      reloadSettings,
      setFeaturedSection,
      toggleFavorite,
      siteSettings,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
