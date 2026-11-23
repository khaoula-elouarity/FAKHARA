import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  fetchAdminDiscoveryPages,
  fetchAdminFeaturedItems,
  fetchAdminFeaturedSection,
  fetchProducts,
  updateAdminDiscoveryPages,
  uploadAdminFeaturedImage,
} from "../services/api.js";
import {
  FEATURED_ITEM_IDS,
  buildFeaturedItems,
  getDiscoveryBlocks,
  localizedText,
  makeBlockId,
  normalizeFeaturedItems,
} from "../utils/featuredItems.js";
import "./AdminFeaturedSection.css";

const labels = {
  ar: {
    eyebrow: "صفحات الاكتشاف",
    title: "إدارة صفحات القطع الثلاث",
    subtitle:
      "لكل قطعة صفحتها الخاصة: أضف أقساماً، عدّل العناوين والنصوص والصور، ورتّبها ثم احفظ.",
    loading: "جارٍ تحميل الصفحات...",
    item: "القطعة",
    blocks: "أقسام الصفحة",
    noBlocks: "لا توجد أقسام لهذه القطعة بعد. أضف أول قسم.",
    addBlock: "إضافة قسم جديد",
    blockTitle: "عنوان القسم",
    blockContent: "نص القسم",
    image: "صورة القسم",
    chooseImage: "اختيار صورة",
    changeImage: "تم تغيير الصورة.",
    removeImage: "إزالة الصورة",
    noImage: "لا توجد صورة",
    up: "تحريك للأعلى",
    down: "تحريك للأسفل",
    delete: "حذف القسم",
    save: "حفظ الصفحة",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ صفحة الاكتشاف.",
    saveError: "تعذر حفظ الصفحة. حاول مجدداً.",
    uploadError: "تعذر تحميل الصورة.",
    imageTooLarge: "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت).",
    loadError: "تعذر تحميل الصفحات. حدّث الصفحة وحاول مجدداً.",
    back: "العودة للقطع الثلاث",
  },
  fr: {
    eyebrow: "PAGES DE DÉCOUVERTE",
    title: "Gérer les pages des trois pièces",
    subtitle:
      "Chaque pièce a sa page : ajoutez des sections, modifiez titres, textes et images, réorganisez puis enregistrez.",
    loading: "Chargement des pages...",
    item: "Pièce",
    blocks: "Sections de la page",
    noBlocks: "Aucune section pour cette pièce. Ajoutez la première section.",
    addBlock: "Ajouter une section",
    blockTitle: "Titre de la section",
    blockContent: "Texte de la section",
    image: "Image de la section",
    chooseImage: "Choisir une image",
    changeImage: "Image modifiée.",
    removeImage: "Retirer l'image",
    noImage: "Aucune image",
    up: "Monter",
    down: "Descendre",
    delete: "Supprimer la section",
    save: "Enregistrer la page",
    saving: "Enregistrement...",
    saved: "La page de découverte a été enregistrée.",
    saveError: "Impossible d'enregistrer la page. Réessayez.",
    uploadError: "Impossible de téléverser l'image.",
    imageTooLarge: "Image trop volumineuse (5 Mo maximum).",
    loadError: "Impossible de charger les pages. Actualisez la page.",
    back: "Retour aux trois pièces",
  },
  en: {
    eyebrow: "DISCOVERY PAGES",
    title: "Manage the three piece pages",
    subtitle:
      "Each piece has its own page: add sections, edit titles, text and images, reorder them, then save.",
    loading: "Loading pages...",
    item: "Piece",
    blocks: "Page sections",
    noBlocks: "No sections for this piece yet. Add the first section.",
    addBlock: "Add a section",
    blockTitle: "Section title",
    blockContent: "Section text",
    image: "Section image",
    chooseImage: "Choose an image",
    changeImage: "Image changed.",
    removeImage: "Remove image",
    noImage: "No image",
    up: "Move up",
    down: "Move down",
    delete: "Delete section",
    save: "Save page",
    saving: "Saving...",
    saved: "The discovery page was saved.",
    saveError: "Could not save the page. Try again.",
    uploadError: "Could not upload the image.",
    imageTooLarge: "Image is too large (5 MB maximum).",
    loadError: "Could not load the pages. Refresh and try again.",
    back: "Back to the three pieces",
  },
};

function getLoadError(language) {
  return labels[language]?.loadError || labels.en.loadError;
}

function updateLocalized(value, language, text) {
  return {
    ar: language === "ar" ? text : value?.ar || text,
    fr: language === "fr" ? text : value?.fr || text,
    en: language === "en" ? text : value?.en || text,
  };
}

export default function AdminDiscoveryPages() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const { reloadSettings } = useStore();
  const navigate = useNavigate();
  const t = labels[language] || labels.en;

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(FEATURED_ITEM_IDS[0]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState("");
  const fileInputRefs = useRef({});

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchAdminDiscoveryPages().catch(() => ({ discoveryPages: [] })),
      fetchAdminFeaturedItems().catch(() => ({ featuredItems: [] })),
      fetchAdminFeaturedSection().catch(() => ({ featuredSection: null })),
      fetchProducts().catch(() => ({ products: [] })),
    ])
      .then(
        ([
          pagesPayload,
          itemsPayload,
          sectionPayload,
          productsPayload,
        ]) => {
          if (cancelled) return;

          const storedItems = normalizeFeaturedItems(itemsPayload?.featuredItems);

          setItems(
            storedItems.length
              ? storedItems
              : buildFeaturedItems(
                  sectionPayload?.featuredSection,
                  productsPayload?.products
                )
          );
          setPages(
            Array.isArray(pagesPayload?.discoveryPages)
              ? pagesPayload.discoveryPages
              : []
          );
        }
      )
      .catch(() => {
        if (!cancelled) setLoadError(getLoadError(language));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const blocks = getDiscoveryBlocks(pages, selectedItemId);

  function setSelectedBlocks(nextBlocks) {
    setPages((current) => {
      const others = current.filter((page) => page?.itemId !== selectedItemId);

      return [...others, { itemId: selectedItemId, blocks: nextBlocks }];
    });
  }

  function updateBlock(blockId, patch) {
    setSelectedBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, ...patch } : block
      )
    );
  }

  function addBlock() {
    setSelectedBlocks([
      ...blocks,
      { id: makeBlockId(), title: {}, content: {}, image: "" },
    ]);
  }

  function removeBlock(blockId) {
    setSelectedBlocks(blocks.filter((block) => block.id !== blockId));
  }

  function moveBlock(index, offset) {
    const target = index + offset;

    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];

    setSelectedBlocks(next);
  }

  async function handleImageUpload(blockId, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingBlockId(blockId);

    try {
      const payload = await uploadAdminFeaturedImage(file);
      const url = payload?.image?.url;

      if (!url) throw new Error("missing_image_url");

      updateBlock(blockId, { image: url });
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
      setUploadingBlockId("");
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);

    try {
      const payload = await updateAdminDiscoveryPages(pages);

      setPages(
        Array.isArray(payload?.discoveryPages) ? payload.discoveryPages : pages
      );
      await reloadSettings().catch(() => {});
      addToast({ type: "success", message: t.saved });
    } catch {
      addToast({ type: "error", message: t.saveError });
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
        <button type="button" onClick={() => navigate("/admin/featured-section")}>
          {t.back} ↗
        </button>
      </div>

      {loadError && (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="admin-empty">{t.loading}</div>
      ) : (
        <form className="admin-discovery-form" onSubmit={handleSubmit}>
          <div className="admin-discovery-toolbar">
            <label className="admin-discovery-field">
              {t.item}
              <select
                value={selectedItemId}
                onChange={(event) => setSelectedItemId(event.target.value)}
              >
                {FEATURED_ITEM_IDS.map((id, index) => (
                  <option value={id} key={id}>
                    {index + 1}.{" "}
                    {localizedText(items[index]?.title, language) || id}
                  </option>
                ))}
              </select>
            </label>
            <span className="admin-discovery-summary">
              {t.blocks}: {blocks.length}
            </span>
          </div>

          {blocks.length ? (
            <div className="admin-discovery-blocks">
              {blocks.map((block, index) => (
                <article className="admin-discovery-block" key={block.id}>
                  <div className="admin-discovery-block-image">
                    {block.image ? (
                      <img src={block.image} alt={t.image} />
                    ) : (
                      <span>{t.noImage}</span>
                    )}
                    <input
                      ref={(element) => {
                        fileInputRefs.current[block.id] = element;
                      }}
                      className="admin-discovery-block-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      disabled={uploadingBlockId === block.id}
                      onChange={(event) => handleImageUpload(block.id, event)}
                    />
                    <button
                      type="button"
                      disabled={uploadingBlockId === block.id}
                      onClick={() => fileInputRefs.current[block.id]?.click()}
                    >
                      {t.chooseImage}
                    </button>
                    {block.image && (
                      <button
                        type="button"
                        onClick={() => updateBlock(block.id, { image: "" })}
                      >
                        {t.removeImage}
                      </button>
                    )}
                  </div>

                  <div className="admin-discovery-block-fields">
                    <label className="admin-discovery-field">
                      {t.blockTitle}
                      <input
                        value={block.title?.[language] || ""}
                        onChange={(event) =>
                          updateBlock(block.id, {
                            title: updateLocalized(
                              block.title,
                              language,
                              event.target.value
                            ),
                          })
                        }
                      />
                    </label>

                    <label className="admin-discovery-field">
                      {t.blockContent}
                      <textarea
                        rows="4"
                        value={block.content?.[language] || ""}
                        onChange={(event) =>
                          updateBlock(block.id, {
                            content: updateLocalized(
                              block.content,
                              language,
                              event.target.value
                            ),
                          })
                        }
                      />
                    </label>

                    <div className="admin-discovery-block-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, -1)}
                      >
                        {t.up}
                      </button>
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={() => moveBlock(index, 1)}
                      >
                        {t.down}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => removeBlock(block.id)}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-discovery-empty">{t.noBlocks}</div>
          )}

          <div className="admin-discovery-add">
            <button type="button" onClick={addBlock}>
              {t.addBlock}
            </button>
          </div>

          <div className="admin-modal-actions">
            <button type="submit" disabled={saving || Boolean(uploadingBlockId)}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
