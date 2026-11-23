import React from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import {
  getDiscoveryBlocks,
  getFeaturedItems,
  localizedText,
} from "../utils/featuredItems.js";
import "./DiscoveryPage.css";

const labels = {
  ar: {
    home: "الرئيسية",
    eyebrow: "قطعة تستحق الاكتشاف",
    back: "العودة إلى الصفحة الرئيسية",
    explore: "تصفحي جميع المجموعات",
    notFound: "لم نعثر على هذه الصفحة.",
    notFoundHint: "اختاري إحدى القطع الثلاث من الصفحة الرئيسية.",
    empty: "محتوى هذه القطعة سيضاف قريباً.",
  },
  fr: {
    home: "Accueil",
    eyebrow: "Pièce à découvrir",
    back: "Retour à l'accueil",
    explore: "Voir toutes les collections",
    notFound: "Cette page est introuvable.",
    notFoundHint: "Choisissez l'une des trois pièces sur la page d'accueil.",
    empty: "Le contenu de cette pièce sera ajouté bientôt.",
  },
  en: {
    home: "Home",
    eyebrow: "A piece worth discovering",
    back: "Back to homepage",
    explore: "Browse all collections",
    notFound: "This page was not found.",
    notFoundHint: "Choose one of the three pieces on the homepage.",
    empty: "Content for this piece will be added soon.",
  },
};

function DiscoveryImage({ image, alt, label }) {
  return (
    <div className="discovery-image">
      {image ? (
        <img src={image} alt={alt} />
      ) : (
        <div className="discovery-image-placeholder">
          <span>F</span>
          <small>{label}</small>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  const { itemId } = useParams();
  const { language, direction } = useLanguage();
  const { featuredItems, featuredSection, discoveryPages, products } = useStore();
  const t = labels[language] || labels.en;

  const items = getFeaturedItems(featuredItems, featuredSection, products);
  const item = items.find((entry) => entry.id === itemId);
  const blocks = getDiscoveryBlocks(discoveryPages, itemId);

  if (!item) {
    return (
      <main className="discovery-page" dir={direction}>
        <div className="discovery-shell discovery-not-found">
          <h1>{t.notFound}</h1>
          <p>{t.notFoundHint}</p>
          <Link to="/">{t.back}</Link>
        </div>
      </main>
    );
  }

  const title = localizedText(item.title, language);
  const sectionLabel =
    localizedText(featuredSection?.label, language) || t.eyebrow;
  const sectionDescription = localizedText(
    featuredSection?.description,
    language
  );

  return (
    <main className="discovery-page" dir={direction}>
      <div className="discovery-shell">
        <nav className="discovery-breadcrumb" aria-label={t.home}>
          <Link to="/">{t.home}</Link>
          <span>/</span>
          <span>{title}</span>
        </nav>

        <section className="discovery-hero">
          <DiscoveryImage image={item.image} alt={title} label={title} />

          <div className="discovery-hero-copy">
            <span>{sectionLabel}</span>
            <h1>{title}</h1>
            {sectionDescription && <p>{sectionDescription}</p>}
            <Link to="/collections">{t.explore} ↗</Link>
          </div>
        </section>

        {blocks.length ? (
          <div className="discovery-blocks">
            {blocks.map((block, index) => {
              const blockTitle = localizedText(block.title, language);
              const blockContent = localizedText(block.content, language);

              return (
                <section
                  className={`discovery-block${
                    index % 2 ? " discovery-block-reverse" : ""
                  }`}
                  key={block.id}
                >
                  <DiscoveryImage
                    image={block.image}
                    alt={blockTitle || title}
                    label={t.eyebrow}
                  />

                  <div className="discovery-block-copy">
                    {blockTitle && <h2>{blockTitle}</h2>}
                    {blockContent && <p>{blockContent}</p>}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="discovery-empty">{t.empty}</p>
        )}

        <div className="discovery-footer-link">
          <Link to="/">← {t.back}</Link>
        </div>
      </div>
    </main>
  );
}
