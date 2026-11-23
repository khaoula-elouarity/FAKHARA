import React, { useEffect, useState } from "react";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  fetchAdminSettings,
  updateAdminHomepage,
} from "../services/api.js";
import "./AdminDashboard.css";

const labels = {
  ar: {
    title: "محتوى الصفحة الرئيسية",
    subtitle: "عدّل العناوين والأوصاف والنصوص التي تظهر في الصفحة الرئيسية.",
    loading: "جارٍ تحميل المحتوى...",
    save: "حفظ محتوى الصفحة الرئيسية",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ المحتوى.",
    saveError: "تعذر حفظ المحتوى.",
    hero: "القسم الرئيسي",
    promise: "وعود فخارة",
    categories: "المجموعات",
    featured: "القطع المميزة",
    story: "حكاية فخارة",
    track: "تتبع الطلب",
    visit: "زوروا متجرنا",
    number: "الرقم",
    promiseTitle: "العنوان",
    promiseDescription: "الوصف",
  },
  fr: {
    title: "Contenu de la page d'accueil",
    subtitle:
      "Modifiez les titres, descriptions et textes affichés sur la page d'accueil.",
    loading: "Chargement du contenu...",
    save: "Enregistrer le contenu",
    saving: "Enregistrement...",
    saved: "Contenu enregistré.",
    saveError: "Impossible d'enregistrer le contenu.",
    hero: "Section principale",
    promise: "Les engagements Fakhara",
    categories: "Les collections",
    featured: "Les pièces en vedette",
    story: "L'histoire de Fakhara",
    track: "Suivi de commande",
    visit: "Visiter la boutique",
    number: "Numéro",
    promiseTitle: "Titre",
    promiseDescription: "Description",
  },
  en: {
    title: "Homepage content",
    subtitle: "Edit the titles, descriptions, and text shown on the homepage.",
    loading: "Loading content...",
    save: "Save homepage content",
    saving: "Saving...",
    saved: "Content saved.",
    saveError: "Could not save content.",
    hero: "Hero section",
    promise: "Fakhara promises",
    categories: "Collections",
    featured: "Featured pieces",
    story: "Fakhara story",
    track: "Order tracking",
    visit: "Visit our store",
    number: "Number",
    promiseTitle: "Title",
    promiseDescription: "Description",
  },
};

const fieldGroups = [
  {
    key: "hero",
    fields: [
      "heroLabel",
      "heroTitle",
      "heroTitleAccent",
      "heroDescription",
      "explore",
      "discover",
      "scroll",
    ],
  },
  {
    key: "categories",
    fields: ["categoriesLabel", "categoriesTitle", "categoriesDescription", "viewAll"],
  },
  {
    key: "featured",
    fields: ["featuredLabel", "featuredTitle", "featuredDescription", "productButton"],
  },
  {
    key: "story",
    fields: ["storyLabel", "storyTitle", "storyDescription", "storyButton"],
  },
  {
    key: "track",
    fields: ["trackLabel", "trackTitle", "trackDescription", "trackButton"],
  },
  {
    key: "visit",
    fields: [
      "visitLabel",
      "visitTitle",
      "visitDescription",
      "address",
      "map",
      "mapTitle",
      "mapLabel",
      "mapNote",
      "zoomLabel",
      "zoomIn",
      "zoomOut",
      "directions",
      "visitButton",
    ],
  },
];

export default function AdminHomepageContent() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const { reloadSettings } = useStore();
  const t = labels[language] || labels.en;

  const [content, setContent] = useState(null);
  const [editingLanguage, setEditingLanguage] = useState("ar");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAdminSettings()
      .then((payload) => {
        if (!cancelled) {
          setContent(payload?.settings?.homepage || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          addToast({ type: "error", message: t.saveError });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [addToast, t.saveError]);

  function setField(field, value) {
    setContent((current) => ({
      ...current,
      [editingLanguage]: {
        ...current?.[editingLanguage],
        [field]: value,
      },
    }));
  }

  function setPromise(index, field, value) {
    setContent((current) => {
      const promise = [...(current?.[editingLanguage]?.promise || [])];
      promise[index] = { ...(promise[index] || {}), [field]: value };

      return {
        ...current,
        [editingLanguage]: {
          ...current?.[editingLanguage],
          promise,
        },
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = await updateAdminHomepage(content);
      setContent(payload.homepage);
      await reloadSettings().catch(() => {});
      addToast({ type: "success", message: t.saved });
    } catch {
      addToast({ type: "error", message: t.saveError });
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return <div className="admin-empty">{t.loading}</div>;
  }

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <h2>{t.title}</h2>
        <div className="admin-filter-buttons">
          {["ar", "fr", "en"].map((code) => (
            <button
              type="button"
              key={code}
              className={editingLanguage === code ? "active" : "is-secondary"}
              onClick={() => setEditingLanguage(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="admin-section-meta">{t.subtitle}</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        {fieldGroups.map((group) => (
          <React.Fragment key={group.key}>
            <h3 className="admin-form-wide">{t[group.key]}</h3>
            {group.fields.map((field) => (
              <label
                className={field.includes("Description") ? "admin-form-wide" : ""}
                key={field}
              >
                {field}
                {field.includes("Description") ? (
                  <textarea
                    rows="3"
                    value={content[editingLanguage]?.[field] || ""}
                    onChange={(event) => setField(field, event.target.value)}
                  />
                ) : (
                  <input
                    value={content[editingLanguage]?.[field] || ""}
                    onChange={(event) => setField(field, event.target.value)}
                  />
                )}
              </label>
            ))}
          </React.Fragment>
        ))}

        <h3 className="admin-form-wide">{t.promise}</h3>
        {(content[editingLanguage]?.promise || []).map((item, index) => (
          <React.Fragment key={index}>
            <label>
              {t.number}
              <input
                value={item.number || ""}
                onChange={(event) =>
                  setPromise(index, "number", event.target.value)
                }
              />
            </label>
            <label>
              {t.promiseTitle}
              <input
                value={item.title || ""}
                onChange={(event) =>
                  setPromise(index, "title", event.target.value)
                }
              />
            </label>
            <label className="admin-form-wide">
              {t.promiseDescription}
              <input
                value={item.description || ""}
                onChange={(event) =>
                  setPromise(index, "description", event.target.value)
                }
              />
            </label>
          </React.Fragment>
        ))}

        <div className="admin-form-wide">
          <button type="submit" disabled={saving}>
            {saving ? t.saving : t.save}
          </button>
        </div>
      </form>
    </section>
  );
}
