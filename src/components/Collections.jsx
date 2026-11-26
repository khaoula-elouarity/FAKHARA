import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { localizedContent } from "../utils/localizedContent.js";
import ZellijMosaic from "./ZellijMosaic";
import "./Collections.css";

const content = {
  ar: {
    home: "الرئيسية",
    collections: "مجموعاتنا",
    eyebrow: "اكتشفوا مجموعاتنا",
    title: "مجموعاتنا الفخارية",
    description:
      "تشكيلة من القطع الفخارية المغربية الأصيلة، صُنعت بعناية لتضيف لمسة من الدفء والأناقة إلى منزلك.",
    discover: "اكتشف المجموعة",
    productsLabel: "منتجات",
    empty: "لا توجد مجموعات متاحة حالياً.",
    categories: {
      tagines: {
        title: "الطواجن",
        description:
          "طواجن فخارية بطابع مغربي أصيل، تجمع بين عراقة الحرفة وذوق المائدة المغربية.",
      },
      cups: {
        title: "الأكواب",
        description:
          "أكواب فخارية تضيف دفئاً وجمالاً إلى لحظاتك اليومية، بلمسة حرفية مميزة.",
      },
      decor: {
        title: "الديكور والمزهريات",
        description:
          "قطع فنية ومزهريات فخارية تزيّن أركان منزلك وتضفي عليه طابعاً مغربياً دافئاً.",
      },
      "plates-bowls": {
        title: "الصحون والزلايف",
        description:
          "صحون وزلايف فخارية بألوان متناسقة وتفاصيل أصيلة تليق بمائدتك.",
      },
      "pottery-touches": {
        title: "لمسات فخارية",
        description:
          "إبداعات فخارية صغيرة تضيف تفاصيل استثنائية ولمسة فنية إلى يومك.",
      },
    },
  },

  fr: {
    home: "Accueil",
    collections: "Nos collections",
    eyebrow: "Explorez nos collections",
    title: "Nos collections de poterie",
    description:
      "Une sélection de pièces en poterie marocaine authentique, façonnées avec soin pour apporter chaleur et élégance à votre intérieur.",
    discover: "Découvrir la collection",
    productsLabel: "produits",
    empty: "Aucune collection disponible pour le moment.",
    categories: {
      tagines: {
        title: "Les tajines",
        description:
          "Des tajines en poterie au caractère marocain authentique, alliant savoir-faire traditionnel et art de la table.",
      },
      cups: {
        title: "Les tasses",
        description:
          "Des tasses en poterie qui apportent chaleur et beauté à vos moments quotidiens.",
      },
      decor: {
        title: "Décoration et vases",
        description:
          "Des pièces artistiques et des vases en poterie pour sublimer votre intérieur d'une touche marocaine.",
      },
      "plates-bowls": {
        title: "Assiettes et Zlayef",
        description:
          "Des assiettes et Zlayef en poterie aux couleurs harmonieuses et aux détails authentiques.",
      },
      "pottery-touches": {
        title: "Touches en poterie",
        description:
          "De petites créations en poterie qui ajoutent une touche artistique et unique à votre quotidien.",
      },
    },
  },

  en: {
    home: "Home",
    collections: "Collections",
    eyebrow: "Explore our collections",
    title: "Our pottery collections",
    description:
      "A selection of authentic Moroccan pottery pieces, thoughtfully crafted to bring warmth and elegance into your home.",
    discover: "Discover collection",
    productsLabel: "products",
    empty: "No collections available right now.",
    categories: {
      tagines: {
        title: "Tagines",
        description:
          "Moroccan pottery tagines with authentic character, blending traditional craftsmanship with table artistry.",
      },
      cups: {
        title: "Cups",
        description:
          "Pottery cups that bring warmth and beauty to your everyday moments.",
      },
      decor: {
        title: "Decor & Vases",
        description:
          "Artistic pottery pieces and vases that bring a warm Moroccan touch to your interiors.",
      },
      "plates-bowls": {
        title: "Plates & Zlayef",
        description:
          "Pottery plates and Zlayef in harmonious colors with authentic details for your table.",
      },
      "pottery-touches": {
        title: "Pottery Touches",
        description:
          "Small pottery creations that add an exceptional artistic detail to your day.",
      },
    },
  },
};

const fallbackVisuals = {
  tagines: {
    image: "/image/collections/Tajines.png",
    position: "center 58%",
  },
  "plates-bowls": {
    image: "/image/collections/zlayef-tbasel.jpeg",
    position: "center",
  },
  cups: {
    image: "/image/collections/akwab.png",
    position: "center",
  },
  decor: {
    image: "/image/collections/decor.png",
    position: "center",
  },
  "pottery-touches": {
    image: "/image/collections/lamasat-fakhariya.jpeg",
    position: "center",
  },
};

export default function Collections() {
  const { language } = useLanguage();
  const { products, categories, loading } = useStore();
  const t = content[language] || content.en;

  const collectionCards = categories.map((category) => {
    const fallback = t.categories[category.id] || t.categories.en || {};
    const visual = fallbackVisuals[category.id] || {};

    return {
      category: category.id,
      title: localizedContent(category.name, language) || fallback.title || category.id,
      description:
        localizedContent(category.description, language) ||
        fallback.description ||
        "",
      image: category.image || visual.image || "",
      position: visual.position || "center",
    };
  });

  return (
    <main className="collections-page">
      <section className="collections-hero">
        <div className="collections-hero-content">
          <div className="collections-breadcrumb">
            <Link to="/">{t.home}</Link>
            <span>/</span>
            <span>{t.collections}</span>
          </div>

          <span className="collections-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
          <div className="collections-gold-line" />
        </div>
      </section>

      <section className="collections-main">
        {collectionCards.length === 0 ? (
          <div className="collections-empty">
            {loading ? "FAKHARA" : t.empty}
          </div>
        ) : (
          <div className="collections-grid">
            {collectionCards.map((card, index) => {
              const count = products.filter(
                (product) => product.category === card.category
              ).length;

              return (
                <Link
                  to={`/collections/${card.category}`}
                  className="collections-card"
                  key={card.category}
                >
                  <div className="collections-media">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.title}
                        style={{ objectPosition: card.position }}
                      />
                    ) : (
                      <div className="collections-placeholder">
                        <ZellijMosaic
                          tone="ivory"
                          tile={46}
                          opacity={0.32}
                          detail={false}
                          light={false}
                        />
                        <span className="collections-placeholder-mark">F</span>
                      </div>
                    )}

                    <span className="collections-card-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="collections-card-body">
                    <span className="collections-card-label">
                      FAKHARA COLLECTION
                    </span>
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>

                    <div className="collections-card-footer">
                      <span className="collections-card-count">
                        {count} {t.productsLabel}
                      </span>
                      <span className="collections-card-cta">
                        {t.discover}
                        <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
