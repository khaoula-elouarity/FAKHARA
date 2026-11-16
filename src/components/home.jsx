import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import storeLocation from "../data/storeLocation.js";
import {
  getStoreDirectionsUrl,
  getStoreMapEmbedUrl,
} from "../utils/storeMap.js";
import "./home.css";

const homeContent = {
  ar: {
    heroLabel: "فن الفخار المغربي الأصيل",
    heroTitle: "حكاية من طين،",
    heroTitleAccent: "وفن يسكن التفاصيل",
    heroDescription:
      "اكتشفي قطعاً فخارية تجمع بين أصالة الحرفة المغربية وجمال التصميم، صُنعت لتضيف لمسة دافئة ومميزة إلى منزلك.",
    explore: "اكتشفي مجموعتنا",
    discover: "اكتشفي عالم فخارة",
    scroll: "اكتشفي المزيد",
    promise: [
      ["01", "صناعة مغربية", "اعتزاز بالحرفة والتراث"],
      ["02", "لمسة فنية", "تفاصيل تحمل روح الإبداع"],
      ["03", "أناقة أصيلة", "جمال يليق بكل منزل"],
    ],
    categoriesLabel: "اكتشفي اختياراتنا",
    categoriesTitle: "عالم من الإبداع الفخاري",
    categoriesDescription:
      "تصفحي مجموعاتنا واكتشفي قطعاً تجمع بين الجمال والاستعمال اليومي.",
    viewAll: "اكتشفي جميع المجموعات",
    categoryNames: [
      "الطواجن",
      "الصحون والزلايف",
      "الأكواب",
      "الديكور والمزهريات",
      "لمسات فخارية",
    ],
    categoryDescriptions: [
      "طواجن بطابع مغربي أصيل",
      "قطع مميزة لتقديم الطعام",
      "أكواب تضيف جمالاً للحظاتك",
      "تفاصيل فنية تزين منزلك",
      "إبداعات فخارية مختلفة",
    ],
    featuredLabel: "اختيارات فخارة",
    featuredTitle: "قطع تستحق الاكتشاف",
    featuredDescription:
      "مجموعة مختارة من إبداعاتنا الفخارية. ستضاف صور المنتجات وتفاصيلها هنا.",
    productNames: ["قطعة فخارية مميزة", "تصميم بطابع مغربي", "إبداع من الطين"],
    productButton: "اكتشفي المنتج",
    storyLabel: "حكاية فخارة",
    storyTitle: "من روح التراث، إلى جمال تفاصيل منزلك",
    storyDescription:
      "في فخارة، نحتفي بجمال الفخار المغربي وبالحرفية التي تنتقل عبر الأجيال. نؤمن أن كل قطعة تحمل حكاية، وأن التفاصيل البسيطة قادرة على صنع فرق كبير.",
    storyButton: "اكتشفي قصتنا",
    visitLabel: "يسعدنا لقاؤكم",
    visitTitle: "زوروا متجرنا",
    visitDescription:
      "اكتشفوا عالم فخارة عن قرب، واستمتعوا بمشاهدة مجموعاتنا الفخارية.",
    address: "عنوان المتجر سيضاف هنا",
    map: "مساحة مخصصة لخريطة المتجر",
    mapTitle: "خريطة متجر فخارة",
    mapLabel: "خريطة المتجر",
    mapNote: "سيتم عرض الموقع الدقيق للمتجر هنا بمجرد إضافته.",
    zoomLabel: "تكبير الخريطة وتصغيرها",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    directions: "الحصول على الاتجاهات",
    visitButton: "معلومات التواصل",
  },

  fr: {
    heroLabel: "L'art authentique de la poterie marocaine",
    heroTitle: "Une histoire d'argile,",
    heroTitleAccent: "un art dans chaque détail",
    heroDescription:
      "Découvrez des pièces en poterie qui réunissent l'authenticité de l'artisanat marocain et la beauté du design.",
    explore: "Découvrir nos collections",
    discover: "Découvrir l'univers Fakhara",
    scroll: "Explorer davantage",
    promise: [
      ["01", "Artisanat marocain", "Un héritage précieux"],
      ["02", "Touche artistique", "Des détails créatifs"],
      ["03", "Élégance authentique", "La beauté au quotidien"],
    ],
    categoriesLabel: "Explorez nos choix",
    categoriesTitle: "Un univers de créativité",
    categoriesDescription:
      "Découvrez nos collections et des pièces pensées pour embellir votre quotidien.",
    viewAll: "Voir toutes les collections",
    categoryNames: [
      "Tajines",
      "Assiettes et bols",
      "Tasses",
      "Décoration et vases",
      "Touches en poterie",
    ],
    categoryDescriptions: [
      "Des tajines au caractère marocain",
      "De belles pièces pour vos tables",
      "Des tasses pour vos moments précieux",
      "Des détails artistiques pour votre intérieur",
      "Des créations originales en poterie",
    ],
    featuredLabel: "La sélection Fakhara",
    featuredTitle: "Des pièces à découvrir",
    featuredDescription:
      "Une sélection de créations en poterie. Les photos et détails des produits seront ajoutés ici.",
    productNames: ["Pièce en poterie", "Création marocaine", "Art de l'argile"],
    productButton: "Découvrir le produit",
    storyLabel: "L'histoire de Fakhara",
    storyTitle: "L'esprit du patrimoine, la beauté de votre intérieur",
    storyDescription:
      "Chez Fakhara, nous célébrons la beauté de la poterie marocaine et le savoir-faire transmis de génération en génération. Chaque pièce raconte une histoire.",
    storyButton: "Découvrir notre histoire",
    visitLabel: "Nous serions ravis de vous accueillir",
    visitTitle: "Visitez notre boutique",
    visitDescription:
      "Découvrez l'univers Fakhara et nos collections de poterie de plus près.",
    address: "L'adresse de la boutique sera ajoutée ici",
    map: "Espace réservé à la carte de la boutique",
    mapTitle: "Carte de la boutique Fakhara",
    mapLabel: "Carte de la boutique",
    mapNote:
      "L'emplacement exact de la boutique sera affiché ici dès qu'il sera disponible.",
    zoomLabel: "Zoom de la carte",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    directions: "Itinéraire",
    visitButton: "Nos coordonnées",
  },

  en: {
    heroLabel: "The art of authentic Moroccan pottery",
    heroTitle: "A story shaped in clay,",
    heroTitleAccent: "art in every detail",
    heroDescription:
      "Discover pottery pieces that bring together the heritage of Moroccan craftsmanship and the beauty of thoughtful design.",
    explore: "Explore our collections",
    discover: "Discover the world of Fakhara",
    scroll: "Discover more",
    promise: [
      ["01", "Moroccan craft", "A heritage to celebrate"],
      ["02", "Artistic touch", "Creative details"],
      ["03", "Timeless elegance", "Beauty for every home"],
    ],
    categoriesLabel: "Explore our selection",
    categoriesTitle: "A world of pottery artistry",
    categoriesDescription:
      "Explore our collections and discover pieces made to enrich everyday moments.",
    viewAll: "Explore all collections",
    categoryNames: [
      "Tagines",
      "Plates & bowls",
      "Cups",
      "Decor & vases",
      "Pottery touches",
    ],
    categoryDescriptions: [
      "Tagines with authentic Moroccan character",
      "Beautiful pieces for your table",
      "Cups for your special moments",
      "Artistic details for your home",
      "Distinctive pottery creations",
    ],
    featuredLabel: "The Fakhara selection",
    featuredTitle: "Pieces worth discovering",
    featuredDescription:
      "A selection of our pottery creations. Product photos and details will be added here.",
    productNames: ["Pottery piece", "Moroccan design", "Art shaped in clay"],
    productButton: "Discover product",
    storyLabel: "The Fakhara story",
    storyTitle: "The spirit of heritage, the beauty of your home",
    storyDescription:
      "At Fakhara, we celebrate the beauty of Moroccan pottery and craftsmanship passed down through generations. We believe every piece carries a story.",
    storyButton: "Discover our story",
    visitLabel: "We would love to welcome you",
    visitTitle: "Visit our store",
    visitDescription:
      "Discover the world of Fakhara and explore our pottery collections in person.",
    address: "The store address will be added here",
    map: "Reserved space for the store map",
    mapTitle: "FAKHARA store map",
    mapLabel: "Store map",
    mapNote:
      "The exact store location will be displayed here once it is available.",
    zoomLabel: "Map zoom controls",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    directions: "Get Directions",
    visitButton: "Contact information",
  },
};

const fallbackCategoryCards = [
  {
    slug: "tagines",
    image: "/image/collections/Tajines.png",
  },
  {
    slug: "plates-bowls",
    image: "/image/collections/zlayef-tbasel.jpeg",
    imageClassName: "category-card-image-plates",
  },
  {
    slug: "cups",
    image: "/image/collections/akwab.png",
    imageClassName: "category-card-image-cups",
  },
  {
    slug: "decor",
    image: "/image/collections/decor.png",
    imageClassName: "category-card-image-decor",
  },
  {
    slug: "pottery-touches",
    image: "/image/collections/lamasat-fakhariya.jpeg",
    imageClassName: "category-card-image-touches",
  },
];

function localized(value, language) {
  return value?.[language] || value?.en || value?.fr || value?.ar || "";
}

function ImagePlaceholder({
  label,
  image,
  alt,
  imageClassName,
  imgRef,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
}) {
  if (image) {
    return (
      <img
        ref={imgRef}
        src={image}
        alt={alt || label}
        className={`home-image-placeholder category-card-image${
          imageClassName ? ` ${imageClassName}` : ""
        }`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
      />
    );
  }

  return (
    <div className="home-image-placeholder">
      <span className="placeholder-mark">F</span>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  const { language, direction } = useLanguage();
  const { categories } = useStore();
  const content = homeContent[language];
  const [mapZoom, setMapZoom] = useState(16);
  const tagineImageRef = useRef(null);
  const platesImageRef = useRef(null);
  const cupsImageRef = useRef(null);
  const decorImageRef = useRef(null);
  const mapEmbedUrl = getStoreMapEmbedUrl(storeLocation, language, mapZoom);
  const directionsUrl = getStoreDirectionsUrl(storeLocation, language);
  const displayAddress = storeLocation.address?.trim() || content.address;

  const resetTagineTilt = () => {
    const image = tagineImageRef.current;

    if (!image) {
      return;
    }

    image.style.transition =
      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    image.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale(1)";
  };

  const handleTaginePointerMove = (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    const image = tagineImageRef.current;

    if (!image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;

    image.style.transition = "transform 0.12s ease-out";
    image.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(
      2
    )}deg) translate3d(0, -6px, 0) scale(1.03)`;
  };

  const resetPlatesTilt = () => {
    const image = platesImageRef.current;

    if (!image) {
      return;
    }

    image.style.transition =
      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    image.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale(1)";
  };

  const handlePlatesPointerMove = (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    const image = platesImageRef.current;

    if (!image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;

    image.style.transition = "transform 0.12s ease-out";
    image.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(
      2
    )}deg) translate3d(0, -6px, 0) scale(1.03)`;
  };

  const resetCupsTilt = () => {
    const image = cupsImageRef.current;

    if (!image) {
      return;
    }

    image.style.transition =
      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    image.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale(1)";
  };

  const handleCupsPointerMove = (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    const image = cupsImageRef.current;

    if (!image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;

    image.style.transition = "transform 0.12s ease-out";
    image.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(
      2
    )}deg) translate3d(0, -6px, 0) scale(1.03)`;
  };

  const resetDecorTilt = () => {
    const image = decorImageRef.current;

    if (!image) {
      return;
    }

    image.style.transition =
      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    image.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale(1)";
  };

  const handleDecorPointerMove = (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    const image = decorImageRef.current;

    if (!image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;

    image.style.transition = "transform 0.12s ease-out";
    image.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(
      2
    )}deg) translate3d(0, -6px, 0) scale(1.03)`;
  };

  const adjustMapZoom = (step) => {
    setMapZoom((currentZoom) =>
      Math.min(20, Math.max(4, currentZoom + step))
    );
  };

  const categoryInteractions = {
    tagines: {
      imgRef: tagineImageRef,
      onPointerMove: handleTaginePointerMove,
      onPointerLeave: resetTagineTilt,
      onPointerCancel: resetTagineTilt,
    },
    "plates-bowls": {
      imgRef: platesImageRef,
      onPointerMove: handlePlatesPointerMove,
      onPointerLeave: resetPlatesTilt,
      onPointerCancel: resetPlatesTilt,
    },
    cups: {
      imgRef: cupsImageRef,
      onPointerMove: handleCupsPointerMove,
      onPointerLeave: resetCupsTilt,
      onPointerCancel: resetCupsTilt,
    },
    decor: {
      imgRef: decorImageRef,
      onPointerMove: handleDecorPointerMove,
      onPointerLeave: resetDecorTilt,
      onPointerCancel: resetDecorTilt,
    },
  };

  const homeCategories =
    categories.length > 0
      ? categories.map((category, index) => {
          const fallbackIndex = fallbackCategoryCards.findIndex(
            (item) => item.slug === category.id
          );
          const fallback = fallbackCategoryCards[fallbackIndex] || {};
          const contentIndex = fallbackIndex >= 0 ? fallbackIndex : index;

          return {
            slug: category.id,
            name:
              localized(category.name, language) ||
              content.categoryNames[contentIndex] ||
              category.id,
            description:
              localized(category.description, language) ||
              content.categoryDescriptions[contentIndex] ||
              "",
            image: category.image || fallback.image || "",
            imageClassName: fallback.imageClassName,
          };
        })
      : content.categoryNames.map((name, index) => {
          const fallback = fallbackCategoryCards[index] || {};

          return {
            slug: fallback.slug || `collection-${index + 1}`,
            name,
            description: content.categoryDescriptions[index],
            image: fallback.image || "",
            imageClassName: fallback.imageClassName,
          };
        });

  return (
    <main className="home-page" dir={direction}>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">{content.heroLabel}</span>

          <h1 className="home-hero-title">
            {content.heroTitle}
            <span>{content.heroTitleAccent}</span>
          </h1>

          <p className="home-hero-description">
            {content.heroDescription}
          </p>

          <div className="home-hero-buttons">
            <Link to="/collections" className="home-primary-button">
              {content.explore}
              <span>↗</span>
            </Link>

            <a href="#our-story" className="home-text-button">
              {content.discover}
            </a>
          </div>

          <div className="home-hero-note">
            <span></span>
            {content.scroll}
          </div>
        </div>

        <div className="home-hero-art">
          <div className="home-hero-arch">
            <img
              src="/image/homee/Home.png"
              alt="فخار مغربي أصيل"
              className="home-hero-image"
            />
          </div>

          <div className="home-hero-ring ring-one"></div>
          <div className="home-hero-ring ring-two"></div>

          <span className="home-hero-caption">FAKHARA · MOROCCO</span>
          <span className="home-hero-index">01 — 05</span>
        </div>
      </section>

      {/* BRAND PROMISE */}
      <section className="home-promise">
        <div className="home-promise-inner">
          {content.promise.map((item) => (
            <div className="promise-item" key={item[0]}>
              <span className="promise-number">{item[0]}</span>
              <div>
                <h3>{item[1]}</h3>
                <p>{item[2]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section home-categories">
        <div className="home-section-heading">
          <span className="home-eyebrow">{content.categoriesLabel}</span>
          <h2>{content.categoriesTitle}</h2>
          <p>{content.categoriesDescription}</p>
        </div>

        <div className="category-grid">
          {homeCategories.map((category, index) => {
            const interaction = categoryInteractions[category.slug] || {};

            return (
              <Link
                to={`/collections/${category.slug}`}
                className={`category-card category-card-${index + 1}`}
                key={category.slug}
              >
                <ImagePlaceholder
                  label="CATEGORY IMAGE"
                  image={category.image || undefined}
                  alt={category.name}
                  imageClassName={category.imageClassName}
                  imgRef={interaction.imgRef}
                  onPointerMove={interaction.onPointerMove}
                  onPointerLeave={interaction.onPointerLeave}
                  onPointerCancel={interaction.onPointerCancel}
                />

                <div className="category-card-info">
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>

                  <span className="category-arrow">↗</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-centered-action">
          <Link to="/collections" className="home-outline-button">
            {content.viewAll}
            <span>↗</span>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="home-featured">
        <div className="home-section">
          <div className="home-section-heading">
            <span className="home-eyebrow">{content.featuredLabel}</span>
            <h2>{content.featuredTitle}</h2>
            <p>{content.featuredDescription}</p>
          </div>

          <div className="featured-grid">
            {content.productNames.map((name, index) => (
              <div className="featured-card" key={name}>
                <Link
  to={`/product/demo-${index + 1}`}
  className="featured-image"
>
  <ImagePlaceholder label="PRODUCT IMAGE" />

  <div className="product-orbit orbit-one">
    <span></span>
  </div>

  <div className="product-orbit orbit-two">
    <span></span>
  </div>

  <div className="product-orbit orbit-three">
    <span></span>
  </div>

  <span className="featured-view">↗</span>
</Link>

                <div className="featured-info">
                  <span>FAKHARA COLLECTION</span>
                  <h3>{name}</h3>
                  <Link to={`/product/demo-${index + 1}`}>
                    {content.productButton} ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="home-section home-story" id="our-story">
        <div className="story-visual">
          <div className="story-frame">
            <ImagePlaceholder label="OUR STORY IMAGE" />
          </div>
          <span className="story-decoration">F</span>
        </div>

        <div className="story-content">
          <span className="home-eyebrow">{content.storyLabel}</span>
          <h2>{content.storyTitle}</h2>
          <p>{content.storyDescription}</p>

          <Link to="/about" className="home-outline-button">
            {content.storyButton}
            <span>↗</span>
          </Link>
        </div>
      </section>

      {/* VISIT OUR STORE */}
      <section className="home-visit">
        <div className="home-visit-content">
          <span className="home-eyebrow">{content.visitLabel}</span>
          <h2>{content.visitTitle}</h2>
          <p>{content.visitDescription}</p>
          <span className="visit-address">{displayAddress}</span>

          <Link to="/contact" className="home-primary-button">
            {content.visitButton}
            <span>↗</span>
          </Link>
        </div>

        <div className="home-map-card">
          <iframe
            className="home-map-frame"
            src={mapEmbedUrl}
            title={content.mapTitle}
            loading="eager"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div
            className="home-map-zoom"
            role="group"
            aria-label={content.zoomLabel}
          >
            <button
              type="button"
              onClick={() => adjustMapZoom(1)}
              aria-label={content.zoomIn}
              disabled={mapZoom >= 20}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => adjustMapZoom(-1)}
              aria-label={content.zoomOut}
              disabled={mapZoom <= 4}
            >
              −
            </button>
          </div>

          <a
            className="home-map-directions"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.directions}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

    </main>
  );
}