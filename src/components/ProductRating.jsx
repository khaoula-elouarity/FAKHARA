import React, { useEffect, useId, useState } from "react";
import { Star } from "lucide-react";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useProductRating from "../hooks/useProductRating.js";
import { getFeedback } from "../utils/storeFeedback.js";
import "./ProductRating.css";

const STAR_VALUES = [1, 2, 3, 4, 5];
const MAX_REVIEW_LENGTH = 1000;

const labels = {
  ar: {
    loading: "جارٍ تحميل التقييمات",
    unavailable: "تعذر تحميل التقييمات",
    noRatings: "لا توجد تقييمات بعد",
    reviewsTitle: "آراء الزبائن",
    noReviews: "كن أول من يقيّم هذه القطعة.",
    rateTitle: "قيّم هذه القطعة",
    updateTitle: "تحديث تقييمك",
    chooseRating: "اختر تقييمك",
    reviewLabel: "رأيك (اختياري)",
    reviewPlaceholder: "شاركنا انطباعك عن هذه القطعة...",
    submit: "إرسال التقييم",
    update: "تحديث التقييم",
    submitting: "جارٍ الإرسال...",
    saved: "تم حفظ تقييمك. شكراً لك.",
    yourSelection: (rating) => `تقييمك: ${rating} من 5`,
    starLabel: (rating) => `تقييم ${rating} من 5`,
    averageLabel: (average) => `متوسط التقييم ${average} من 5`,
    count: (count) => {
      if (count === 1) return "تقييم واحد";
      if (count === 2) return "تقييمان";
      if (count >= 3 && count <= 10) return `${count} تقييمات`;
      return `${count} تقييمًا`;
    },
    characterCount: (count) => `${count}/${MAX_REVIEW_LENGTH}`,
    errorSelectRating: "اختر من نجمة واحدة إلى خمس نجوم.",
    errorReview: "يجب ألا يتجاوز رأيك 1000 حرف.",
    errorProduct: "هذا المنتج غير متاح للتقييم.",
    errorNetwork: "تعذر الاتصال بالخادم. حاول مرة أخرى.",
    errorGeneric: "تعذر حفظ التقييم. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    customer: "زبون فخارة",
    noComment: "بدون تعليق مكتوب",
  },
  fr: {
    loading: "Chargement des avis",
    unavailable: "Impossible de charger les avis",
    noRatings: "Aucun avis pour le moment",
    reviewsTitle: "Avis clients",
    noReviews: "Soyez le premier à donner votre avis.",
    rateTitle: "Notez cette pièce",
    updateTitle: "Modifier votre avis",
    chooseRating: "Choisissez votre note",
    reviewLabel: "Votre avis (facultatif)",
    reviewPlaceholder: "Partagez votre impression sur cette pièce...",
    submit: "Publier l'avis",
    update: "Mettre à jour",
    submitting: "Envoi...",
    saved: "Votre avis a bien été enregistré.",
    yourSelection: (rating) => `Votre note : ${rating} sur 5`,
    starLabel: (rating) => `Noter ${rating} sur 5`,
    averageLabel: (average) => `Note moyenne : ${average} sur 5`,
    count: (count) => `${count} avis`,
    characterCount: (count) => `${count}/${MAX_REVIEW_LENGTH}`,
    errorSelectRating: "Choisissez une note de 1 à 5 étoiles.",
    errorReview: "Votre avis ne peut pas dépasser 1000 caractères.",
    errorProduct: "Ce produit ne peut pas être noté.",
    errorNetwork: "Connexion au serveur impossible. Réessayez.",
    errorGeneric: "L'avis n'a pas pu être enregistré. Réessayez.",
    retry: "Réessayer",
    customer: "Client FAKHARA",
    noComment: "Aucun commentaire écrit",
  },
  en: {
    loading: "Loading ratings",
    unavailable: "Ratings are unavailable",
    noRatings: "No ratings yet",
    reviewsTitle: "Customer reviews",
    noReviews: "Be the first to review this piece.",
    rateTitle: "Rate this piece",
    updateTitle: "Update your rating",
    chooseRating: "Choose your rating",
    reviewLabel: "Your review (optional)",
    reviewPlaceholder: "Share your thoughts about this piece...",
    submit: "Submit rating",
    update: "Update rating",
    submitting: "Submitting...",
    saved: "Your rating has been saved. Thank you.",
    yourSelection: (rating) => `Your rating: ${rating} out of 5`,
    starLabel: (rating) => `Rate ${rating} out of 5`,
    averageLabel: (average) => `Average rating ${average} out of 5`,
    count: (count) => `${count} ${count === 1 ? "rating" : "ratings"}`,
    characterCount: (count) => `${count}/${MAX_REVIEW_LENGTH}`,
    errorSelectRating: "Choose a rating from 1 to 5 stars.",
    errorReview: "Your review cannot exceed 1000 characters.",
    errorProduct: "This product cannot be rated.",
    errorNetwork: "Could not reach the server. Please try again.",
    errorGeneric: "The rating could not be saved. Please try again.",
    retry: "Try again",
    customer: "FAKHARA customer",
    noComment: "No written comment",
  },
};

const formErrorMessages = {
  invalid_rating: "errorSelectRating",
  invalid_review: "errorReview",
  product_not_found: "errorProduct",
  network_error: "errorNetwork",
  payload_too_large: "errorReview",
};

function StarDisplay({ value = 0, size = 16, label }) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  const width = `${(safeValue / 5) * 100}%`;

  return (
    <span
      className="product-rating-stars"
      role="img"
      aria-label={label}
      dir="ltr"
    >
      <span
        className="product-rating-stars__row product-rating-stars__row--empty"
        aria-hidden="true"
      >
        {STAR_VALUES.map((star) => (
          <Star key={star} size={size} strokeWidth={1.6} />
        ))}
      </span>
      <span
        className="product-rating-stars__filled"
        style={{ width }}
        aria-hidden="true"
      >
        <span className="product-rating-stars__row">
          {STAR_VALUES.map((star) => (
            <Star
              key={star}
              size={size}
              strokeWidth={1.6}
              fill="currentColor"
            />
          ))}
        </span>
      </span>
    </span>
  );
}

function formatDate(value, language) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-GB",
    { dateStyle: "medium" }
  ).format(date);
}

function CompactRating({ data, loading, error, labels: t }) {
  if (loading) {
    return (
      <span
        className="product-rating-compact product-rating-compact--loading"
        aria-label={t.loading}
      >
        ···
      </span>
    );
  }

  if (error || !data) {
    return (
      <span className="product-rating-compact product-rating-compact--error">
        {t.unavailable}
      </span>
    );
  }

  const hasRatings = data.count > 0 && data.average !== null;

  return (
    <span className="product-rating-compact">
      <StarDisplay
        value={data.average || 0}
        size={13}
        label={
          hasRatings
            ? t.averageLabel(data.average.toFixed(1))
            : t.noRatings
        }
      />
      <span className="product-rating-compact__text">
        {hasRatings
          ? `${data.average.toFixed(1)} · ${t.count(data.count)}`
          : t.noRatings}
      </span>
    </span>
  );
}

export default function ProductRating({ productId, variant = "full" }) {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const t = labels[language] || labels.en;
  const feedback = getFeedback(language);
  const headingId = useId();
  const { data, loading, error, submitting, submit, reload } =
    useProductRating(productId);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRating(0);
    setReview("");
    setHoverRating(0);
    setFormError(null);
    setSaved(false);
  }, [productId]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setRating(data.userRating?.rating || 0);
    setReview(data.userRating?.review || "");
    setFormError(null);
  }, [data]);

  if (variant === "compact") {
    return (
      <CompactRating
        data={data}
        loading={loading}
        error={error}
        labels={t}
      />
    );
  }

  const hasRatings = data && data.count > 0 && data.average !== null;
  const selectedRating = hoverRating || rating;
  const errorKey = formErrorMessages[formError];
  const errorText = errorKey ? t[errorKey] : t.errorGeneric;

  function selectRating(value) {
    setRating(value);
    setSaved(false);
    setFormError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!rating) {
      setFormError("invalid_rating");
      return;
    }

    if (review.length > MAX_REVIEW_LENGTH) {
      setFormError("invalid_review");
      return;
    }

    setFormError(null);
    setSaved(false);

    try {
      await submit({ rating, review });
      setSaved(true);
      addToast({ type: "success", message: feedback.ratingSaved });
    } catch (submitError) {
      setFormError(submitError.code || "request_failed");
    }
  }

  return (
    <section
      className="product-rating-panel"
      aria-labelledby={headingId}
    >
      <div className="product-rating-panel__heading">
        <span className="product-rating-panel__eyebrow">FAKHARA</span>
        <h2 id={headingId}>{t.reviewsTitle}</h2>
        <div className="product-rating-panel__line"></div>
      </div>

      {loading ? (
        <p className="product-rating-panel__state" role="status">
          {t.loading}
        </p>
      ) : error ? (
        <div className="product-rating-panel__state" role="status">
          <p>{t.unavailable}</p>
          <button
            type="button"
            className="product-rating-panel__retry"
            onClick={reload}
          >
            {t.retry}
          </button>
        </div>
      ) : (
        data && (
          <div className="product-rating-panel__content">
            <div className="product-rating-summary">
              <strong className="product-rating-summary__average">
                {hasRatings ? data.average.toFixed(1) : "—"}
              </strong>
              <div className="product-rating-summary__details">
                <StarDisplay
                  value={data.average || 0}
                  size={20}
                  label={
                    hasRatings
                      ? t.averageLabel(data.average.toFixed(1))
                      : t.noRatings
                  }
                />
                <span>
                  {hasRatings ? t.count(data.count) : t.noRatings}
                </span>
              </div>
            </div>

            <form
              className="product-rating-form"
              onSubmit={handleSubmit}
            >
              <h3>
                {data.userRating ? t.updateTitle : t.rateTitle}
              </h3>

              <div
                className="product-rating-picker"
                role="group"
                aria-label={t.chooseRating}
                onMouseLeave={() => setHoverRating(0)}
              >
                {STAR_VALUES.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      value <= selectedRating
                        ? "product-rating-picker__star is-active"
                        : "product-rating-picker__star"
                    }
                    aria-label={t.starLabel(value)}
                    aria-pressed={rating === value}
                    onClick={() => selectRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onFocus={() => setHoverRating(value)}
                    onBlur={() => setHoverRating(0)}
                  >
                    <Star
                      size={30}
                      strokeWidth={1.5}
                      fill={
                        value <= selectedRating
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <p className="product-rating-form__selection">
                  {t.yourSelection(rating)}
                </p>
              )}

              <label className="product-rating-form__review">
                <span>{t.reviewLabel}</span>
                <textarea
                  value={review}
                  maxLength={MAX_REVIEW_LENGTH}
                  rows={4}
                  placeholder={t.reviewPlaceholder}
                  onChange={(event) => {
                    setReview(event.target.value);
                    setSaved(false);
                    setFormError(null);
                  }}
                />
              </label>

              <div className="product-rating-form__footer">
                <span className="product-rating-form__counter" dir="ltr">
                  {t.characterCount(review.length)}
                </span>
                <button
                  type="submit"
                  className="product-rating-form__submit"
                  disabled={submitting}
                >
                  {submitting
                    ? t.submitting
                    : data.userRating
                      ? t.update
                      : t.submit}
                </button>
              </div>

              {formError && (
                <p className="product-rating-form__message is-error" role="alert">
                  {errorText}
                </p>
              )}

              {saved && !formError && (
                <p className="product-rating-form__message is-success" role="status">
                  {t.saved}
                </p>
              )}
            </form>

            <div className="product-reviews">
              <h3>
                {t.reviewsTitle}
                <span>{data.count}</span>
              </h3>

              {data.reviews.length === 0 ? (
                <p className="product-reviews__empty">{t.noReviews}</p>
              ) : (
                <ul className="product-reviews__list">
                  {data.reviews.map((item) => (
                    <li
                      className="product-reviews__item"
                      key={item.id || `${item.createdAt}-${item.rating}`}
                    >
                      <div className="product-reviews__meta">
                        <StarDisplay
                          value={item.rating}
                          size={14}
                          label={t.starLabel(item.rating)}
                        />
                        <time dateTime={item.updatedAt}>
                          {formatDate(item.updatedAt, language)}
                        </time>
                      </div>
                      <p>
                        {item.review || (
                          <em>{t.noComment}</em>
                        )}
                      </p>
                      <span className="product-reviews__author">
                        {t.customer}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
      )}
    </section>
  );
}
