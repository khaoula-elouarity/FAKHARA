import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useLanguage } from "../context/Languagecontext.jsx";
import "./FeaturedProductModal.css";

const labels = {
  ar: {
    close: "إغلاق تفاصيل القطعة",
    currency: "درهم",
    description: "وصف القطعة",
    image: "صورة القطعة",
  },
  fr: {
    close: "Fermer les détails de la pièce",
    currency: "DH",
    description: "Description de la pièce",
    image: "Image de la pièce",
  },
  en: {
    close: "Close piece details",
    currency: "MAD",
    description: "About this piece",
    image: "Piece image",
  },
};

export default function FeaturedProductModal({ card, onClose }) {
  const { language, direction } = useLanguage();
  const t = labels[language] || labels.en;
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    closingRef.current = false;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [card.key]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  useEffect(
    () => () => window.clearTimeout(closeTimerRef.current),
    []
  );

  const productName = card.name || "";
  const productDescription = card.description || "";
  const price = Number(card.price) || 0;

  return createPortal(
    <div
      className={`featured-modal${closing ? " is-closing" : ""}`}
      dir={direction}
      role="presentation"
    >
      <div
        className="featured-modal__backdrop"
        aria-hidden="true"
        onClick={requestClose}
      />

      <div
        className="featured-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="featured-modal__close"
          onClick={requestClose}
          aria-label={t.close}
        >
          <X size={20} strokeWidth={1.6} />
        </button>

        <div className="featured-modal__gallery">
          {card.image ? (
            <img
              className="featured-modal__image"
              src={card.image}
              alt={productName || t.image}
            />
          ) : (
            <div className="featured-modal__image-empty">
              <span>F</span>
              <small>{t.image}</small>
            </div>
          )}
        </div>

        <div className="featured-modal__content">
          <span className="featured-modal__eyebrow">FAKHARA</span>
          <h2 id={titleId}>{productName}</h2>

          <h3>{t.description}</h3>
          <p className="featured-modal__description">{productDescription}</p>

          <div className="featured-modal__price" dir="ltr">
            <span>{price.toLocaleString("en-US")}</span>
            <small>{t.currency}</small>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
