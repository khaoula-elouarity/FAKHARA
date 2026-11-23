import React, { useEffect, useMemo, useState } from "react";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { fetchAdminSettings, updateAdminSettings } from "../services/api.js";
import {
  buildWhatsAppLink,
  formatWhatsAppNumber,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
} from "../utils/whatsapp.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import "./AdminWhatsAppSettings.css";

const labels = {
  ar: {
    eyebrow: "التواصل عبر واتساب",
    title: "إعدادات واتساب",
    subtitle:
      "تحكم في الرقم الذي يستعمله زر التواصل العائم وزر طلب المنتج في المتجر.",
    number: "رقم واتساب",
    hint: "أدخل الرقم مع رمز الدولة، مثال: +212649613615",
    save: "حفظ الرقم",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ رقم واتساب بنجاح.",
    loadError: "تعذر تحميل إعدادات واتساب.",
    saveError: "تعذر حفظ رقم واتساب. تحقق من الاتصال وحاول مجدداً.",
    invalid: "أدخل رقم واتساب صالحاً مع رمز الدولة.",
    preview: "معاينة الرقم",
    previewHint: "هذا هو الرابط الذي سيُفتح عند الضغط على زر واتساب.",
    openPreview: "تجربة رابط واتساب",
    current: "الرقم المستعمل حالياً",
    notAvailable: "غير متاح",
    loading: "جارٍ تحميل الإعدادات...",
  },
  fr: {
    eyebrow: "CONTACT WHATSAPP",
    title: "Paramètres WhatsApp",
    subtitle:
      "Gérez le numéro utilisé par le bouton flottant et le bouton de commande produit.",
    number: "Numéro WhatsApp",
    hint: "Saisissez le numéro avec l'indicatif pays, ex. : +212649613615",
    save: "Enregistrer le numéro",
    saving: "Enregistrement...",
    saved: "Le numéro WhatsApp a été enregistré.",
    loadError: "Impossible de charger les paramètres WhatsApp.",
    saveError:
      "Impossible d'enregistrer le numéro WhatsApp. Vérifiez la connexion.",
    invalid: "Saisissez un numéro WhatsApp valide avec l'indicatif pays.",
    preview: "Aperçu du numéro",
    previewHint:
      "C'est le lien qui s'ouvrira lorsque le visiteur clique sur WhatsApp.",
    openPreview: "Tester le lien WhatsApp",
    current: "Numéro actuellement utilisé",
    notAvailable: "Non disponible",
    loading: "Chargement des paramètres...",
  },
  en: {
    eyebrow: "WHATSAPP CONTACT",
    title: "WhatsApp settings",
    subtitle:
      "Manage the number used by the floating contact button and product order button.",
    number: "WhatsApp number",
    hint: "Enter the number with its country code, e.g. +212649613615",
    save: "Save number",
    saving: "Saving...",
    saved: "The WhatsApp number was saved.",
    loadError: "Unable to load the WhatsApp settings.",
    saveError:
      "Unable to save the WhatsApp number. Check the connection and try again.",
    invalid: "Enter a valid WhatsApp number with its country code.",
    preview: "Number preview",
    previewHint:
      "This is the link visitors will open when they click the WhatsApp button.",
    openPreview: "Test the WhatsApp link",
    current: "Number currently in use",
    notAvailable: "Not available",
    loading: "Loading settings...",
  },
};

export default function AdminWhatsAppSettings() {
  const { language } = useLanguage();
  const { reloadSettings } = useStore();
  const { addToast } = useToast();
  const t = labels[language] || labels.en;

  const [form, setForm] = useState("");
  const [currentNumber, setCurrentNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAdminSettings()
      .then((payload) => {
        if (cancelled) return;

        const settings = payload?.settings || {};
        const displayNumber =
          settings.displayNumber ||
          formatWhatsAppNumber(settings.whatsappNumber);

        setForm(displayNumber);
        setCurrentNumber(displayNumber);
      })
      .catch(() => {
        if (!cancelled) {
          setError(t.loadError);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t.loadError]);

  const previewNumber = useMemo(() => {
    if (!isValidWhatsAppNumber(form)) {
      return "";
    }

    return formatWhatsAppNumber(form);
  }, [form]);

  const previewLink = previewNumber
    ? buildWhatsAppLink(normalizeWhatsAppNumber(form))
    : "";

  async function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);

    if (!isValidWhatsAppNumber(form)) {
      setError(t.invalid);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = await updateAdminSettings({
        whatsappNumber: form,
      });
      const settings = payload?.settings || {};
      const displayNumber =
        settings.displayNumber || formatWhatsAppNumber(form);

      setForm(displayNumber);
      setCurrentNumber(displayNumber);
      setSaved(true);
      await reloadSettings().catch(() => {});
      addToast({ type: "success", message: t.saved });
    } catch (saveError) {
      setError(
        saveError?.code === "invalid_whatsapp_number"
          ? t.invalid
          : t.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section admin-whatsapp-settings">
      <div className="admin-whatsapp-heading">
        <span>{t.eyebrow}</span>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="admin-empty">{t.loading}</div>
      ) : (
        <div className="admin-whatsapp-grid">
          <form className="admin-whatsapp-card" onSubmit={handleSubmit}>
            <label>
              <span>{t.number}</span>
              <input
                type="tel"
                name="whatsappNumber"
                value={form}
                onChange={(event) => {
                  setForm(event.target.value);
                  setSaved(false);
                  setError("");
                }}
                placeholder="+212649613615"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                required
              />
            </label>

            <p className="admin-whatsapp-hint">{t.hint}</p>

            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}

            {saved && (
              <p className="admin-whatsapp-success" role="status">
                {t.saved}
              </p>
            )}

            <button type="submit" disabled={saving}>
              {saving ? t.saving : t.save}
            </button>
          </form>

          <aside className="admin-whatsapp-preview">
            <span>{t.preview}</span>
            <strong dir="ltr">
              {previewNumber || t.notAvailable}
            </strong>

            {previewNumber ? (
              <a
                href={previewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="admin-whatsapp-icon" />
                <span>{t.openPreview}</span>
              </a>
            ) : null}

            <p>{t.previewHint}</p>

            <div className="admin-whatsapp-current">
              <span>{t.current}</span>
              <strong dir="ltr">{currentNumber || t.notAvailable}</strong>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
