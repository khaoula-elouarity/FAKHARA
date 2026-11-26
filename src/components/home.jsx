import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import storeLocation from "../data/storeLocation.js";
import {
  getStoreDirectionsUrl,
  getStoreMapEmbedUrl,
} from "../utils/storeMap.js";
import { normalizeFeaturedItems } from "../utils/featuredItems.js";
import { localizedContent } from "../utils/localizedContent.js";
import "./home.css";

const categoryVisualPresets = [
  { slug: "tagines" },
  {
    slug: "plates-bowls",
    imageClassName: "category-card-image-plates",
  },
  {
    slug: "cups",
    imageClassName: "category-card-image-cups",
  },
  {
    slug: "decor",
    imageClassName: "category-card-image-decor",
  },
  {
    slug: "pottery-touches",
    imageClassName: "category-card-image-touches",
  },
];

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
  const { categories, products, featuredItems, featuredSection, homepage } =
    useStore();
  const content = { ...(homepage?.ar || {}), ...(homepage?.[language] || {}) };
  const [mapZoom, setMapZoom] = useState(16);
  const tagineImageRef = useRef(null);
  const platesImageRef = useRef(null);
  const cupsImageRef = useRef(null);
  const decorImageRef = useRef(null);
  const mapEmbedUrl = getStoreMapEmbedUrl(storeLocation, language, mapZoom);
  const directionsUrl = getStoreDirectionsUrl(storeLocation, language);
  const displayAddress = content.address;

  const featuredSettings = featuredSection || {};
  const featuredVisible = featuredSettings.isVisible !== false;
  const featuredLabelText =
    localizedContent(featuredSettings.label, language) || content.featuredLabel;
  const featuredTitleText =
    localizedContent(featuredSettings.title, language) || content.featuredTitle;
  const featuredDescriptionText =
    localizedContent(featuredSettings.description, language) ||
    content.featuredDescription;
  const featuredButtonText =
    localizedContent(featuredSettings.buttonText, language) || content.productButton;
  const featuredCards = normalizeFeaturedItems(featuredItems)
    .map((item, index) => {
      const product = products.find((entry) => entry.id === item.id);

      if (product && product.isActive === false) {
        return null;
      }

      return {
        key: item.id,
        productId: product?.id || item.id,
        name:
          localizedContent(product?.name, language) ||
          localizedContent(item.title, language) ||
          item.id,
        description: localizedContent(product?.description, language),
        image: product?.image || item.image,
        price: Number(product?.price) || 0,
        button: featuredButtonText,
        primary: index === 0,
      };
    })
    .filter(Boolean);

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

  const homeCategories = categories.map((category) => {
    const fallback = categoryVisualPresets.find(
      (item) => item.slug === category.id
    );

    return {
      slug: category.id,
      name: localizedContent(category.name, language) || category.id,
      description: localizedContent(category.description, language),
      image: category.image || "",
      imageClassName: fallback?.imageClassName,
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
          {(content.promise || []).map((item) => (
            <div className="promise-item" key={item.number}>
              <span className="promise-number">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredVisible && (
        <section className="home-featured">
          <div className="home-section">
            <div className="home-section-heading">
              <span className="home-eyebrow">{featuredLabelText}</span>
              <h2>{featuredTitleText}</h2>
              <p>{featuredDescriptionText}</p>
            </div>

            <div className="featured-grid">
              {featuredCards.map((card) => (
                <div className="featured-card" key={card.key}>
                  <Link
                    to={`/product/${card.productId}`}
                    className={`featured-image${
                      card.primary ? " featured-image-moroccan" : ""
                    }`}
                    aria-label={`${card.button}: ${card.name}`}
                  >
                    <ImagePlaceholder
                      label="PRODUCT IMAGE"
                      image={card.image || undefined}
                      alt={card.name}
                      imageClassName={
                        card.image ? "featured-moroccan-image" : undefined
                      }
                    />

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
                    <h3>{card.name}</h3>
                    <p className="featured-card-description">{card.description}</p>

                    <div className="featured-card-meta">
                      <span className="featured-card-price" dir="ltr">
                        {card.price.toLocaleString("en-US")}{" "}
                        <small>
                          {language === "ar"
                            ? "درهم"
                            : language === "fr"
                              ? "DH"
                              : "MAD"}
                        </small>
                      </span>
                    </div>

                    <Link
                      to={`/product/${card.productId}`}
                      className="featured-discover"
                    >
                      {card.button} ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* OUR STORY */}
      <section className="home-section home-story" id="our-story">
        <div className="story-visual">
          <div className="story-frame">
            <ImagePlaceholder
              label="OUR STORY IMAGE"
              image="/image/homee/tarath-pottery.jpeg"
              alt={content.storyTitle}
              imageClassName="story-image"
            />
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
