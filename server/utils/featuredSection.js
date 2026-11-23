import ApiError from "./ApiError.js";
import {
  readBoolean,
  readLocalized,
  readString,
} from "./validation.js";

export const DEFAULT_FEATURED_SECTION = {
  isVisible: true,
  label: {
    ar: "اختيارات فخارة",
    fr: "La sélection Fakhara",
    en: "The Fakhara selection",
  },
  title: {
    ar: "قطع تستحق الاكتشاف",
    fr: "Des pièces à découvrir",
    en: "Pieces worth discovering",
  },
  description: {
    ar: "مجموعة مختارة من إبداعاتنا الفخارية. ستضاف صور المنتجات وتفاصيلها هنا.",
    fr: "Une sélection de créations en poterie. Les photos et détails des produits seront ajoutés ici.",
    en: "A selection of our pottery creations. Product photos and details will be added here.",
  },
  image: "/image/ikhtiyarat/tasmim%20mn%20tin.jpg",
  productId: "",
  productName: {
    ar: "قطعة فخارية مميزة",
    fr: "Pièce en poterie",
    en: "Pottery piece",
  },
  productInformation: {
    ar: "FAKHARA COLLECTION",
    fr: "FAKHARA COLLECTION",
    en: "FAKHARA COLLECTION",
  },
  buttonText: {
    ar: "اكتشفي المنتج",
    fr: "Découvrir le produit",
    en: "Discover product",
  },
  buttonLink: "",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function localizedOrEmpty(value) {
  return {
    ar: typeof value?.ar === "string" ? value.ar.trim() : "",
    fr: typeof value?.fr === "string" ? value.fr.trim() : "",
    en: typeof value?.en === "string" ? value.en.trim() : "",
  };
}

function hasLocalizedText(value) {
  return Boolean(value?.ar || value?.fr || value?.en);
}

/**
 * A settings document created before this feature existed has an empty
 * `featuredSection`. Return the server-owned initial content in that case;
 * after an administrator saves, stored values (including intentionally empty
 * fields) are used as-is.
 */
function hasSavedContent(section) {
  if (!section || typeof section !== "object") {
    return false;
  }

  return Boolean(
    section.image ||
      section.productId ||
      section.buttonLink ||
      section.isVisible === false ||
      hasLocalizedText(section.label) ||
      hasLocalizedText(section.title) ||
      hasLocalizedText(section.description) ||
      hasLocalizedText(section.productName) ||
      hasLocalizedText(section.productInformation) ||
      hasLocalizedText(section.buttonText)
  );
}

export function serializeFeaturedSection(section) {
  if (!hasSavedContent(section)) {
    return clone(DEFAULT_FEATURED_SECTION);
  }

  return {
    isVisible: section.isVisible !== false,
    label: localizedOrEmpty(section.label),
    title: localizedOrEmpty(section.title),
    description: localizedOrEmpty(section.description),
    image: typeof section.image === "string" ? section.image.trim() : "",
    productId:
      typeof section.productId === "string" ? section.productId.trim() : "",
    productName: localizedOrEmpty(section.productName),
    productInformation:
      section.productInformation === undefined
        ? clone(DEFAULT_FEATURED_SECTION.productInformation)
        : localizedOrEmpty(section.productInformation),
    buttonText: localizedOrEmpty(section.buttonText),
    buttonLink:
      typeof section.buttonLink === "string"
        ? section.buttonLink.trim()
        : "",
  };
}

export function readSafeUrl(value, field) {
  const url = readString(value, field, { required: false, max: 500 });

  if (!url) {
    return "";
  }

  if (
    (url.startsWith("/") && !url.startsWith("//")) ||
    url.startsWith("#") ||
    /^https?:\/\//i.test(url)
  ) {
    return url;
  }

  throw ApiError.badRequest(`invalid_${field}`, {
    field,
    message: "Use a local path starting with / or a full http(s) URL.",
  });
}

export function normalizeFeaturedSection(value) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const title = readLocalized(source.title, "featuredTitle");

  if (!hasLocalizedText(title)) {
    throw ApiError.badRequest("invalid_featured_title", {
      field: "featuredSection.title",
      message: "Enter the section title in at least one language.",
    });
  }

  return {
    isVisible: readBoolean(source.isVisible, true),
    label: readLocalized(source.label, "featuredLabel"),
    title,
    description: readLocalized(source.description, "featuredDescription"),
    image: readSafeUrl(source.image, "featuredImage"),
    productId: readString(source.productId, "featuredProductId", {
      required: false,
      max: 120,
    }),
    productName: readLocalized(source.productName, "featuredProductName"),
    productInformation: readLocalized(
      source.productInformation,
      "featuredProductInformation"
    ),
    buttonText: readLocalized(source.buttonText, "featuredButtonText"),
    buttonLink: readSafeUrl(source.buttonLink, "featuredButtonLink"),
  };
}

export default {
  DEFAULT_FEATURED_SECTION,
  serializeFeaturedSection,
  normalizeFeaturedSection,
};
