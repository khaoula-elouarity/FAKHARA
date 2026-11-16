import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import "./productdetails.css";
import ProductRating from "./ProductRating.jsx";
import WishlistButton from "./wishlistbutton.jsx";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import { addProductToCart, getFeedback } from "../utils/storeFeedback.js";
import { buildProductWhatsAppLink } from "../utils/whatsapp.js";

export default function ProductDetails() {
  const { id } = useParams();
  const { language } = useLanguage();
  const { getProduct, loading, whatsappNumber } = useStore();
  const { addToast } = useToast();
  const product = getProduct(id);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantKey, setSelectedVariantKey] = useState("");
  const feedback = getFeedback(language);

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariantKey("");
    setQuantity(1);
  }, [id]);

  const translations = {
    ar: {
      home: "الرئيسية",
      back: "العودة إلى المجموعة",
      description: "وصف المنتج",
      price: "الثمن",
      quantity: "الكمية",
      variants: "الخيارات المتوفرة",
      decrease: "تقليل الكمية",
      increase: "زيادة الكمية",
      add: "أضف إلى السلة",
      whatsapp: "اطلب عبر واتساب",
      unavailable: "المنتج غير موجود",
      added: "تمت إضافة المنتج إلى السلة",
      image: "صورة المنتج",
      currency: "درهم",
    },
    fr: {
      home: "Accueil",
      back: "Retour à la collection",
      description: "Description",
      price: "Prix",
      quantity: "Quantité",
      variants: "Options disponibles",
      decrease: "Diminuer la quantité",
      increase: "Augmenter la quantité",
      add: "Ajouter au panier",
      whatsapp: "Commander sur WhatsApp",
      unavailable: "Produit introuvable",
      added: "Produit ajouté au panier",
      image: "Image du produit",
      currency: "DH",
    },
    en: {
      home: "Home",
      back: "Back to collection",
      description: "Product description",
      price: "Price",
      quantity: "Quantity",
      variants: "Available options",
      decrease: "Decrease quantity",
      increase: "Increase quantity",
      add: "Add to cart",
      whatsapp: "Order on WhatsApp",
      unavailable: "Product not found",
      added: "Product added to cart",
      image: "Product image",
      currency: "MAD",
    },
  };

  const t = translations[language] || translations.en;

  if (!product) {
    return (
      <main className="product-not-found">
        <h2>{loading ? "FAKHARA" : t.unavailable}</h2>
        {!loading && <Link to="/"> {t.home} </Link>}
      </main>
    );
  }

  const productName = product.name[language] || product.name.en;
  const productDescription =
    product.description?.[language] ||
    product.description?.en ||
    "";
  const productPageUrl = `${window.location.origin}/product/${encodeURIComponent(
    product.id
  )}`;
  const whatsappProductLink = buildProductWhatsAppLink(
    whatsappNumber,
    productName,
    productPageUrl
  );

  const variants = Array.isArray(product.images) ? product.images : [];
  const galleryItems = [];
  const gallerySeen = new Set();

  if (product.image) {
    galleryItems.push({ image: product.image, name: productName });
    gallerySeen.add(product.image);
  }

  (Array.isArray(product.galleryImages) ? product.galleryImages : [])
    .filter((image) => typeof image === "string" && image)
    .forEach((image, index) => {
      if (!gallerySeen.has(image)) {
        galleryItems.push({
          image,
          name: `${productName} ${index + 1}`,
        });
        gallerySeen.add(image);
      }
    });

  // Older products stored their photos as variants. Keep those visible until
  // the administrator adds the new gallery images.
  if (galleryItems.length === 0) {
    variants.forEach((variant) => {
      if (variant.image && !gallerySeen.has(variant.image)) {
        galleryItems.push({
          image: variant.image,
          name:
            variant.name?.[language] ||
            variant.name?.en ||
            productName,
        });
        gallerySeen.add(variant.image);
      }
    });
  }

  const activeGalleryItem = galleryItems.length
    ? galleryItems[Math.min(activeImage, galleryItems.length - 1)]
    : null;
  const selectedVariant =
    variants.find((variant) => variant.key === selectedVariantKey) || null;
  const displayedImage =
    selectedVariant?.image || activeGalleryItem?.image || product.image;
  const displayedImageName = selectedVariant
    ? selectedVariant.name?.[language] ||
      selectedVariant.name?.en ||
      productName
    : activeGalleryItem?.name || productName;
  const displayedPrice =
    selectedVariant?.price !== null &&
    selectedVariant?.price !== undefined
      ? selectedVariant.price
      : product.price;

  function selectGalleryImage(index) {
    setActiveImage(index);
    setSelectedVariantKey("");
  }

  function selectVariant(key) {
    setSelectedVariantKey((current) => (current === key ? "" : key));
  }

  function addToCart() {
    try {
      addProductToCart(
        product.id,
        quantity,
        selectedVariant?.key || ""
      );
      addToast({
        type: "success",
        message: feedback.cartAdded,
        image: displayedImage || undefined,
      });
    } catch {
      addToast({ type: "error", message: feedback.cartError });
    }
  }

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <div className="product-details-breadcrumb">
          <Link to="/">{t.home}</Link>
          <span>/</span>
          <span>{productName}</span>
        </div>

        <div className="product-details-layout">
          <div className="product-gallery">
            <WishlistButton productId={product.id} />
            <div className="product-main-image">
              {displayedImage ? (
                <img src={displayedImage} alt={`${productName} - ${displayedImageName}`} />
              ) : (
                <div className="product-image-empty">
                  <span className="product-image-letter">F</span>
                  <span>{t.image}</span>
                </div>
              )}
            </div>

            {galleryItems.length > 1 ? (
              <div className="product-thumbnails">
                {galleryItems.map((item, index) => (
                  <button
                    key={`${item.image}-${index}`}
                    type="button"
                    className={
                      !selectedVariantKey && activeImage === index
                        ? "active"
                        : ""
                    }
                    onClick={() => selectGalleryImage(index)}
                    aria-label={`${productName} - ${item.name}`}
                    aria-pressed={!selectedVariantKey && activeImage === index}
                  >
                    <img src={item.image} alt={item.name} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-details-info">
            <span className="product-details-brand">FAKHARA</span>
            <h1>{productName}</h1>

            <div className="product-details-line"></div>

            <h3>{t.description}</h3>
            <p className="product-details-description">
              {productDescription}
            </p>

            <div className="product-details-price">
              <span>{t.price}</span>
              <strong>
                {displayedPrice} <small>{t.currency}</small>
              </strong>
            </div>

            {variants.length > 0 ? (
              <div className="product-variants">
                <span>{t.variants}</span>
                <div className="product-variant-options">
                  {variants.map((variant) => {
                    const variantName =
                      variant.name?.[language] ||
                      variant.name?.en ||
                      variant.key;

                    return (
                      <button
                        key={variant.key}
                        type="button"
                        className={
                          selectedVariantKey === variant.key ? "active" : ""
                        }
                        onClick={() => selectVariant(variant.key)}
                        aria-pressed={selectedVariantKey === variant.key}
                      >
                        {variant.image ? (
                          <img src={variant.image} alt="" />
                        ) : null}
                        <span>{variantName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="product-quantity">
              <span>{t.quantity}</span>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label={t.decrease}
                  disabled={quantity === 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label={t.increase}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="product-add-button"
              onClick={addToCart}
            >
              {t.add}
            </button>

            <a
              className="product-whatsapp-button"
              href={whatsappProductLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.whatsapp}: ${productName}`}
            >
              <WhatsAppIcon className="product-whatsapp-icon" />
              <span>{t.whatsapp}</span>
            </a>

            <Link
              to={`/collections/${product.category}`}
              className="product-back-link"
            >
              {language === "ar" ? "→" : "←"} {t.back}
            </Link>
          </div>
        </div>

        <ProductRating productId={product.id} />
      </div>
    </main>
  );
}