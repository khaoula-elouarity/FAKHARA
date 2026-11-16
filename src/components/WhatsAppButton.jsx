import React from "react";
import { useLocation } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { buildWhatsAppLink } from "../utils/whatsapp.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import "./WhatsAppButton.css";

const labels = {
  ar: "تواصلوا معنا عبر واتساب",
  fr: "Contactez-nous sur WhatsApp",
  en: "Chat with us on WhatsApp",
};

export default function WhatsAppButton() {
  const { language } = useLanguage();
  const { whatsappNumber } = useStore();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const label = labels[language] || labels.en;

  return (
    <a
      className="whatsapp-fab"
      href={buildWhatsAppLink(whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <span className="whatsapp-fab-tooltip">{label}</span>
      <WhatsAppIcon className="whatsapp-fab-icon" />
    </a>
  );
}
