import React from "react";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getFeedback,
  pulseWishlistIcon,
} from "../utils/storeFeedback.js";
import "./WishlistButton.css";

export default function WishlistButton({ productId }) {
  const { language } = useLanguage();
  const { isFavorite, toggleFavorite } = useStore();
  const { addToast } = useToast();
  const feedback = getFeedback(language);
  const favorite = isFavorite(productId);

  const handleToggle = async () => {
    try {
      const nowFavorite = await toggleFavorite(productId);
      pulseWishlistIcon();

      addToast({
        type: "success",
        message: nowFavorite
          ? feedback.wishlistAdded
          : feedback.wishlistRemoved,
      });
    } catch {
      addToast({ type: "error", message: feedback.cartError });
    }
  };

  const wishlistLabels = {
    ar: {
      add: "إضافة إلى المفضلة",
      remove: "إزالة من المفضلة",
    },
    fr: {
      add: "Ajouter aux favoris",
      remove: "Retirer des favoris",
    },
    en: {
      add: "Add to wishlist",
      remove: "Remove from wishlist",
    },
  };

  const wishlistLabel =
    wishlistLabels[language] || wishlistLabels.en;
  const label = favorite ? wishlistLabel.remove : wishlistLabel.add;

  return (
    <button
      type="button"
      className={`wishlist-button ${favorite ? "active" : ""}`}
      onClick={handleToggle}
      aria-label={label}
      title={label}
      aria-pressed={favorite}
    >
      {favorite ? "♥" : "♡"}
    </button>
  );
}