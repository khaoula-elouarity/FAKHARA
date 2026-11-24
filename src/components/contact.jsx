import React, { useState } from "react";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { buildApiUrl } from "../services/apiConfig.js";
import "./contact.css";

const content = {
ar: {
eyebrow: "نحن هنا من أجلك",
title: "يسعدنا التواصل معك",
description: "عندك سؤال أو استفسار؟ تواصل معنا وسنكون سعداء بمساعدتك.",
infoTitle: "معلومات التواصل",
phone: "الهاتف",
email: "البريد الإلكتروني",
address: "عنوان المتجر",
addressValue: "سيتم إضافة العنوان لاحقاً",
formTitle: "أرسل لنا رسالة",
name: "الاسم الكامل",
emailPlaceholder: "البريد الإلكتروني",
subject: "موضوع الرسالة",
message: "اكتب رسالتك هنا...",
send: "إرسال الرسالة",
success: "شكراً على ثقتكم بـ FAKHARA. يسعدنا تواصلكم معنا، وسنحرص على الرد عليكم في أقرب وقت.",
error: "تعذر إرسال رسالتك حالياً. المرجو المحاولة مرة أخرى لاحقاً.",
sending: "جارٍ الإرسال...",
required: "يرجى ملء جميع الخانات المطلوبة.",
phoneValue: "أضف رقم الهاتف هنا",
emailValue: "أضف البريد الإلكتروني هنا"
},
fr: {
eyebrow: "Nous sommes à votre écoute",
title: "Restons en contact",
description: "Une question ou une demande ? Contactez-nous, nous serons ravis de vous aider.",
infoTitle: "Informations de contact",
phone: "Téléphone",
email: "E-mail",
address: "Adresse du magasin",
addressValue: "Adresse à ajouter ultérieurement",
formTitle: "Envoyez-nous un message",
name: "Nom complet",
emailPlaceholder: "Adresse e-mail",
subject: "Sujet du message",
message: "Écrivez votre message ici...",
send: "Envoyer le message",
success: "Merci pour votre confiance. Nous sommes ravis de votre message et nous vous répondrons dans les meilleurs délais.",
error: "L'envoi de votre message est momentanément indisponible. Veuillez réessayer plus tard.",
sending: "Envoi...",
required: "Veuillez remplir tous les champs obligatoires.",
phoneValue: "Ajoutez votre numéro",
emailValue: "Ajoutez votre adresse e-mail"
},
en: {
eyebrow: "We are here for you",
title: "We would love to hear from you",
description: "Have a question or need help? Contact us, and we will be happy to assist you.",
infoTitle: "Contact information",
phone: "Phone",
email: "Email",
address: "Store address",
addressValue: "Address will be added later",
formTitle: "Send us a message",
name: "Full name",
emailPlaceholder: "Email address",
subject: "Message subject",
message: "Write your message here...",
send: "Send message",
success: "Thank you for trusting FAKHARA. We are delighted to hear from you and will get back to you as soon as possible.",
error: "We could not send your message right now. Please try again later.",
sending: "Sending...",
required: "Please fill in all required fields.",
phoneValue: "Add your phone number",
emailValue: "Add your email address"
}
};

export default function Contact() {
const { language } = useLanguage();
const { addToast } = useToast();
const t = content[language];

const [form, setForm] = useState({
name: "",
email: "",
subject: "",
message: ""
});

const [feedback, setFeedback] = useState(null);
const [submitting, setSubmitting] = useState(false);

const handleChange = (event) => {
setForm({
...form,
[event.target.name]: event.target.value
});
setFeedback(null);
};

const handleSubmit = async (event) => {
event.preventDefault();

if (!form.name.trim() || !form.email.trim() ||
    !form.subject.trim() || !form.message.trim()) {
  setFeedback({ type: "error", message: t.required });
  return;
}

setSubmitting(true);

try {
  const response = await fetch(buildApiUrl("/api/contact"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(form)
  });

  const payload = await response.json().catch(() => null);
  const accepted = Boolean(
    response.ok && payload && (payload.success === true || payload.ok === true)
  );

  if (!accepted) {
    throw new Error("contact_unavailable");
  }

  setFeedback({ type: "success", message: t.success });
  addToast({ type: "success", message: t.success });

  setForm({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
} catch {
  setFeedback({ type: "error", message: t.error });
  addToast({ type: "error", message: t.error });
} finally {
  setSubmitting(false);
}

};

return (
<main className="contact-page">
<section className="contact-hero">
<span className="contact-eyebrow">{t.eyebrow}</span>
<h1>{t.title}</h1>
<p>{t.description}</p>
<span className="contact-decoration">✦</span>
</section>

  <section className="contact-layout">
    <aside className="contact-information">
      <span className="contact-small-title">FAKHARA</span>
      <h2>{t.infoTitle}</h2>

      <div className="contact-info-item">
        <span className="contact-info-icon">☎</span>
        <div>
          <h3>{t.phone}</h3>
          <p>{t.phoneValue}</p>
        </div>
      </div>

      <div className="contact-info-item">
        <span className="contact-info-icon">✉</span>
        <div>
          <h3>{t.email}</h3>
          <p>{t.emailValue}</p>
        </div>
      </div>

      <div className="contact-info-item">
        <span className="contact-info-icon">⌖</span>
        <div>
          <h3>{t.address}</h3>
          <p>{t.addressValue}</p>
        </div>
      </div>

      <div className="contact-info-decoration">FAKHARA</div>
    </aside>

    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{t.formTitle}</h2>

      <label>{t.name}</label>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <label>{t.emailPlaceholder}</label>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <label>{t.subject}</label>
      <input
        type="text"
        name="subject"
        value={form.subject}
        onChange={handleChange}
        required
      />

      <label>{t.message}</label>
      <textarea
        name="message"
        rows="5"
        value={form.message}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={submitting}>
        {submitting ? t.sending : t.send} <span>✦</span>
      </button>

      {feedback && (
        <p
          className={`contact-feedback ${feedback.type === "success" ? "is-success" : "is-error"}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
    </form>
  </section>
</main>

);
}