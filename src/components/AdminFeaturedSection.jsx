import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  fetchAdminFeaturedItems,
  fetchAdminFeaturedSection,
  fetchProducts,
  updateAdminFeaturedItems,
  uploadAdminFeaturedImage,
} from "../services/api.js";
import {
  FEATURED_ITEM_IDS,
  buildFeaturedItems,
  normalizeFeaturedItems,
} from "../utils/featuredItems.js";
import "./AdminFeaturedSection.css";

const labels = {
  ar: {
    eyebrow: "الصفحة الرئيسية",
    title: "قطعة تستحق الاكتشاف",
    subtitle: "ثلاث قطع فقط: غيّر الصورة والعنوان لكل قطعة ثم اضغط حفظ.",
    loading: "جارٍ تحميل القطع الثلاث...",
    item: "القطعة",
    image: "صورة القطعة",
    chooseImage: "اختيار صورة من الجهاز",
    changeImage: "تم تغيير الصورة.",
    removeImage: "إزالة الصورة",
    noImage: "لا توجد صورة بعد.",
    titleLabel: "عنوان القطعة",
    titleHint: "يظهر هذا العنوان في البطاقة وفي صفحة الاكتشاف.",
    uploadError: "تعذر تحميل الصورة.",
    imageTooLarge: "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت).",
    save: "حفظ القطع الثلاث",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ القطع الثلاث.",
    saveError: "تعذر الحفظ. تحقق من الصور والعناوين وحاول مجدداً.",
    requiredTitle: "أدخل عنواناً لكل قطعة.",
    invalidImage: "أدخل رابط صورة صالحاً أو اختر صورة من جهازك.",
    loadError: "تعذر تحميل القطع. حدّث الصفحة وحاول مجدداً.",
    managePages: "إدارة صفحات الاكتشاف",
  },
  fr: {
    eyebrow: "PAGE D'ACCUEIL",
    title: "Pièces à découvrir",
    subtitle:
      "Trois pièces seulement : modifiez l'image et le titre de chaque pièce, puis enregistrez.",
    loading: "Chargement des trois pièces...",
    item: "Pièce",
    image: "Image de la pièce",
    chooseImage: "Choisir une image",
    changeImage: "Image modifiée.",
    removeImage: "Retirer l'image",
    noImage: "Aucune image pour le moment.",
    titleLabel: "Titre de la pièce",
    titleHint: "Ce titre s'affiche sur la carte et dans la page de découverte.",
    uploadError: "Impossible de téléverser l'image.",
    imageTooLarge: "Image trop volumineuse (5 Mo maximum).",
    save: "Enregistrer les trois pièces",
    saving: "Enregistrement...",
    saved: "Les trois pièces ont été enregistrées.",
    saveError: "Impossible d'enregistrer. Vérifiez les images et les titres.",
    requiredTitle: "Saisissez un titre pour chaque pièce.",
    invalidImage: "Saisissez une URL d'image valide ou choisissez une image.",
    loadError: "Impossible de charger les pièces. Actualisez la page.",
    managePages: "Gérer les pages de découverte",
  },
  en: {
    eyebrow: "HOMEPAGE",
    title: "Pieces worth discovering",
    subtitle: "Only three pieces: change each image and title, then save.",
    loading: "Loading the three pieces...",
    item: "Piece",
    image: "Piece image",
    chooseImage: "Choose an image",
    changeImage: "Image changed.",
    removeImage: "Remove image",
    noImage: "No image yet.",
    titleLabel: "Piece title",
    titleHint: "This title appears on the card and on the discovery page.",
    uploadError: "Could not upload the image.",
    imageTooLarge: "Image is too large (5 MB maximum).",
    save: "Save the three pieces",
    saving: "Saving...",
    saved: "The three pieces were saved.",
    saveError: "Could not save. Check the images and titles and try again.",
    requiredTitle: "Enter a title for each piece.",
    invalidImage: "Enter a valid image URL or choose an image.",
    loadError: "Could not load the pieces. Refresh and try again.",
    managePages: "Manage discovery pages",
  },
};

function getLoadError(language) {
  return labels[language]?.loadError || labels.en.loadError;
}

function updateTitle(title, value) {
  return {
    ar: value,
    fr: title?.fr || value,
    en: title?.en || value,
  };
}

export default function AdminFeaturedSection() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const { reload, reloadSettings } = useStore();
  const navigate = useNavigate();
  const t = labels[language] || labels.en;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(-1);
  const [error, setError] = useState("");
  const fileInputRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchAdminFeaturedItems().catch(() => ({ featuredItems: [] })),
      fetchAdminFeaturedSection().catch(() => ({ featuredSection: null })),
      fetchProducts().catch(() => ({ products: [] })),
    ])
      .then(([itemsPayload, sectionPayload, productsPayload]) => {
        if (cancelled) return;

        const products = productsPayload?.products || [];
        const stored = normalizeFeaturedItems(itemsPayload?.featuredItems).map(
          (item) => {
            const product = products.find((entry) => entry.id === item.id);

            if (!product) {
              return item;
            }

            return {
              ...item,
              title: product.name || item.title,
              image: product.image || item.image,
            };
          }
        );

        setItems(
          stored.length
            ? stored
            : buildFeaturedItems(
                sectionPayload?.featuredSection,
                productsPayload?.products
              )
        );
      })
      .catch(() => {
        if (!cancelled) setError(getLoadError(language));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  function updateItem(index, patch) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
    setError("");
  }

  async function handleImageUpload(index, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingIndex(index);

    try {
      const payload = await uploadAdminFeaturedImage(file);
      const url = payload?.image?.url;

      if (!url) throw new Error("missing_image_url");

      updateItem(index, { image: url });
      addToast({ type: "success", message: t.changeImage });
    } catch (uploadError) {
      addToast({
        type: "error",
        message:
          uploadError.code === "image_too_large"
            ? t.imageTooLarge
            : t.uploadError,
      });
    } finally {
      setUploadingIndex(-1);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalized = normalizeFeaturedItems(items);

    if (!normalized.length) {
      setError(t.requiredTitle);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = await updateAdminFeaturedItems(normalized);
      const saved = normalizeFeaturedItems(payload?.featuredItems);

      setItems(saved.length ? saved : normalized);
      await Promise.all([
        reload().catch(() => {}),
        reloadSettings().catch(() => {}),
      ]);
      addToast({ type: "success", message: t.saved });
    } catch (saveError) {
      if (saveError.code === "invalid_featured_item_title") {
        setError(t.requiredTitle);
      } else if (saveError.code === "invalid_featuredImage") {
        setError(t.invalidImage);
      } else {
        setError(t.saveError);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section admin-featured-settings">
      <div className="admin-featured-heading">
        <span>{t.eyebrow}</span>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="admin-featured-shortcut">
        <button type="button" onClick={() => navigate("/admin/discovery-pages")}>
          {t.managePages} ↗
        </button>
      </div>

      {loading ? (
        <div className="admin-empty">{t.loading}</div>
      ) : (
        <form className="admin-featured-items-form" onSubmit={handleSubmit}>
          <div className="admin-featured-items-grid">
            {FEATURED_ITEM_IDS.map((id, index) => {
              const item = items[index] || { title: {}, image: "" };

              return (
                <article className="admin-featured-item-card" key={id}>
                  <div className="admin-featured-item-heading">
                    <span>{t.item}</span>
                    <strong>{index + 1}</strong>
                  </div>

                  <div className="admin-featured-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title?.ar || t.image} />
                    ) : (
                      <span>{t.noImage}</span>
                    )}
                  </div>

                  <input
                    ref={(element) => {
                      fileInputRefs.current[index] = element;
                    }}
                    className="admin-featured-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    disabled={uploadingIndex === index}
                    onChange={(event) => handleImageUpload(index, event)}
                  />

                  <div className="admin-featured-item-actions">
                    <button
                      type="button"
                      disabled={uploadingIndex === index}
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      {uploadingIndex === index ? t.saving : t.chooseImage}
                    </button>
                    {item.image && (
                      <button
                        type="button"
                        onClick={() => updateItem(index, { image: "" })}
                      >
                        {t.removeImage}
                      </button>
                    )}
                  </div>

                  <label className="admin-featured-item-field">
                    {t.titleLabel}
                    <input
                      value={item.title?.ar || ""}
                      onChange={(event) =>
                        updateItem(index, {
                          title: updateTitle(item.title, event.target.value),
                        })
                      }
                    />
                    <small>{t.titleHint}</small>
                  </label>
                </article>
              );
            })}
          </div>

          {error && (
            <p className="admin-error admin-form-wide" role="alert">
              {error}
            </p>
          )}

          <div className="admin-modal-actions">
            <button type="submit" disabled={saving || uploadingIndex >= 0}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
