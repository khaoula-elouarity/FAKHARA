import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import "./Footer.css";

const footerContent = {
ar: {
description: "نحتفي بجمال الفخار المغربي ونقدم لكم قطعاً تجمع بين أصالة التراث وأناقة التفاصيل.",
explore: "اكتشف الموقع",
collections: "مجموعاتنا",
contact: "تواصل معنا",
home: "الرئيسية",
about: "من نحن",
trackOrder: "تتبع طلبي",

contactLink: "اتصل بنا",
categories: [
["الطواجن", "/collections/tagines"],
["الصحون والزلايف", "/collections/plates-bowls"],
["الأكواب", "/collections/cups"],
["الديكور والمزهريات", "/collections/decor"],
["لمسات فخارية", "/collections/pottery-touches"]
],
email: "البريد الإلكتروني",
phone: "الهاتف",
rights: "جميع الحقوق محفوظة."
},
fr: {
description: "Nous célébrons la beauté de la poterie marocaine avec des créations qui allient tradition et élégance.",
explore: "Explorer",
collections: "Nos collections",
contact: "Contact",
home: "Accueil",
about: "À propos",
trackOrder: "Suivre ma commande",

contactLink: "Nous contacter",
categories: [
["Tajines", "/collections/tagines"],
["Assiettes et bols", "/collections/plates-bowls"],
["Tasses", "/collections/cups"],
["Décoration et vases", "/collections/decor"],
["Touches en poterie", "/collections/pottery-touches"]
],
email: "E-mail",
phone: "Téléphone",
rights: "Tous droits réservés."
},
en: {
description: "We celebrate the beauty of Moroccan pottery through creations that combine heritage and elegance.",
explore: "Explore",
collections: "Our collections",
contact: "Contact",
home: "Home",
about: "About us",
trackOrder: "Track My Order",

contactLink: "Contact us",
categories: [
["Tagines", "/collections/tagines"],
["Plates and bowls", "/collections/plates-bowls"],
["Cups", "/collections/cups"],
["Decor and vases", "/collections/decor"],
["Pottery touches", "/collections/pottery-touches"]
],
email: "Email",
phone: "Phone",
rights: "All rights reserved."
}
};

export default function Footer() {
const { language, t } = useLanguage();
const content = footerContent[language];

return (
<footer className="site-footer">
<div className="footer-main">
<div className="footer-brand">
<Link to="/" className="footer-logo">
<span className="footer-logo-symbol">F</span>
<span>FAKHARA</span>
</Link>

      <p>{content.description}</p>

      <div className="footer-socials">
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">FB</a>
        <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest">P</a>
      </div>
    </div>

    <div className="footer-column">
      <h3>{content.explore}</h3>
      <Link to="/">{content.home}</Link>
      <Link to="/about">{content.about}</Link>
      <Link to="/track-order">{content.trackOrder}</Link>
      <Link to="/contact">{content.contactLink}</Link>
    </div>

    <div className="footer-column">
      <h3>{content.collections}</h3>
      {content.categories.map(([name, path]) => (
        <Link to={path} key={path}>{name}</Link>
      ))}
    </div>

    <div className="footer-column">
      <h3>{content.contact}</h3>
      <p>{content.email}</p>
      <span className="footer-placeholder">Email will be added later</span>
      <p>{content.phone}</p>
      <span className="footer-placeholder">Phone will be added later</span>
    </div>
  </div>

  <div className="footer-bottom">
    <span>© {new Date().getFullYear()} FAKHARA. {content.rights}</span>
    <span className="footer-bottom-mark">✦ Crafted with Moroccan inspiration</span>
  </div>
</footer>

);
}