import React, { useState } from "react";
import { useLanguage } from "../context/Languagecontext.jsx";
import { createCustomizationRequest } from "../services/api.js";
import "./CustomizeGift.css";

const translations = {
ar: {
eyebrow: "هدية بتفاصيلك الخاصة",
title: "اصنع هديتك",
description: "اختار القطعة الفخارية وصممها بالطريقة اللي كتعجبك.",
product: "اختار نوع القطعة",
products: ["طاجين", "طقم صحون وزلايف", "أكواب", "مزهرية", "قطعة ديكور"],
color: "اختار اللون",
colors: ["الأخضر", "الأزرق", "الأبيض", "البيج", "ألوان متعددة"],
decoration: "اختار نوع الزخرفة",
decorations: ["زخرفة مغربية تقليدية", "زليج مغربي", "نقوش نباتية", "تصميم بسيط", "تصميم خاص"],
name: "الاسم أو العبارة على الهدية",
namePlaceholder: "اكتب الاسم أو العبارة هنا...",
notes: "ملاحظات إضافية",
notesPlaceholder: "شرح لينا كيف بغيتي تكون هديتك...",
quantity: "الكمية",
preview: "ملخص تصميمك",
submit: "إرسال طلب التخصيص",
success: "تم حفظ طلب التخصيص بنجاح!",
required: "يرجى اختيار نوع القطعة واللون والزخرفة."
},
fr: {
eyebrow: "Un cadeau à votre image",
title: "Créez votre cadeau",
description: "Choisissez votre pièce en poterie et personnalisez-la selon vos envies.",
product: "Choisir le type de pièce",
products: ["Tajine", "Assiettes et bols", "Tasses", "Vase", "Décoration"],
color: "Choisir la couleur",
colors: ["Vert", "Bleu", "Blanc", "Beige", "Multicolore"],
decoration: "Choisir la décoration",
decorations: ["Motifs marocains traditionnels", "Zellige marocain", "Motifs floraux", "Design minimaliste", "Design personnalisé"],
name: "Nom ou texte sur le cadeau",
namePlaceholder: "Écrivez votre texte ici...",
notes: "Notes supplémentaires",
notesPlaceholder: "Décrivez votre idée...",
quantity: "Quantité",
preview: "Résumé de votre création",
submit: "Envoyer la demande",
success: "Votre demande a été enregistrée !",
required: "Veuillez choisir une pièce, une couleur et une décoration."
},
en: {
eyebrow: "A gift made personal",
title: "Create your gift",
description: "Choose your pottery piece and personalize it just the way you like.",
product: "Choose a pottery piece",
products: ["Tagine", "Plates and bowls set", "Cups", "Vase", "Decorative piece"],
color: "Choose a color",
colors: ["Green", "Blue", "White", "Beige", "Multicolor"],
decoration: "Choose a decoration",
decorations: ["Traditional Moroccan patterns", "Moroccan zellige", "Floral patterns", "Minimal design", "Custom design"],
name: "Name or text on the gift",
namePlaceholder: "Write your text here...",
notes: "Additional notes",
notesPlaceholder: "Describe your idea...",
quantity: "Quantity",
preview: "Your design summary",
submit: "Send customization request",
success: "Your customization request has been saved!",
required: "Please choose a piece, color and decoration."
}
};

export default function CustomizeGift() {
const { language } = useLanguage();
const t = translations[language];

const [form, setForm] = useState({
product: "",
color: "",
decoration: "",
customText: "",
notes: "",
quantity: 1
});

const [feedback, setFeedback] = useState("");
const [submitting, setSubmitting] = useState(false);

const submitError = {
  ar: "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.",
  fr: "Impossible d'envoyer la demande. Réessayez.",
  en: "Could not send the request. Please try again."
};

const updateField = (field, value) => {
setForm((previous) => ({
...previous,
[field]: value
}));
setFeedback("");
};

const handleSubmit = async (event) => {
event.preventDefault();

if (!form.product || !form.color || !form.decoration) {
  setFeedback(t.required);
  return;
}

setSubmitting(true);
setFeedback("");

try {
  await createCustomizationRequest({
    ...form,
    language
  });

  setFeedback(t.success);

  setForm({
    product: "",
    color: "",
    decoration: "",
    customText: "",
    notes: "",
    quantity: 1
  });
} catch {
  setFeedback(submitError[language] || submitError.en);
} finally {
  setSubmitting(false);
}

};

return (
<main className="customize-page">
<section className="customize-hero">
<span className="customize-eyebrow">{t.eyebrow}</span>
<h1>{t.title}</h1>
<p>{t.description}</p>
<span className="customize-star">✦</span>
</section>

  <section className="customize-container">
    <form className="customize-form" onSubmit={handleSubmit}>
      <div className="customize-form-heading">
        <span>FAKHARA</span>
        <h2>{t.title}</h2>
      </div>

      <div className="customize-field">
        <label>{t.product}</label>
        <select
          value={form.product}
          onChange={(e) => updateField("product", e.target.value)}
          required
        >
          <option value="">—</option>
          {t.products.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="customize-field">
        <label>{t.color}</label>
        <select
          value={form.color}
          onChange={(e) => updateField("color", e.target.value)}
          required
        >
          <option value="">—</option>
          {t.colors.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="customize-field">
        <label>{t.decoration}</label>
        <select
          value={form.decoration}
          onChange={(e) => updateField("decoration", e.target.value)}
          required
        >
          <option value="">—</option>
          {t.decorations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="customize-field">
        <label>{t.name}</label>
        <input
          type="text"
          value={form.customText}
          onChange={(e) => updateField("customText", e.target.value)}
          placeholder={t.namePlaceholder}
        />
      </div>

      <div className="customize-field">
        <label>{t.notes}</label>
        <textarea
          rows="4"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder={t.notesPlaceholder}
        />
      </div>

      <div className="customize-field customize-quantity">
        <label>{t.quantity}</label>
        <input
          type="number"
          min="1"
          max="50"
          value={form.quantity}
          onChange={(e) =>
            updateField("quantity", Math.max(1, Number(e.target.value)))
          }
        />
      </div>

      <button
        type="submit"
        className="customize-submit"
        disabled={submitting}
      >
        {t.submit} <span>✦</span>
      </button>

      {feedback && (
        <p className="customize-feedback" role="status">
          {feedback}
        </p>
      )}
    </form>

    <aside className="customize-preview">
      <div className="customize-preview-art">
        <span>✧</span>
        <small>YOUR UNIQUE CREATION</small>
      </div>

      <h2>{t.preview}</h2>

      <div className="customize-summary-row">
        <span>{t.product}</span>
        <strong>{form.product || "—"}</strong>
      </div>

      <div className="customize-summary-row">
        <span>{t.color}</span>
        <strong>{form.color || "—"}</strong>
      </div>

      <div className="customize-summary-row">
        <span>{t.decoration}</span>
        <strong>{form.decoration || "—"}</strong>
      </div>

      <div className="customize-summary-row">
        <span>{t.quantity}</span>
        <strong>{form.quantity}</strong>
      </div>
    </aside>
  </section>
</main>

);
}