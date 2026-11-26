import { localizedContent } from "./localizedContent.js";

export const FEATURED_ITEM_IDS = ["featured-1", "featured-2", "featured-3"];

export const FEATURED_FALLBACK_NAMES = {
  ar: ["قطعة فخارية مميزة", "تصميم بطابع مغربي", "إبداع من الطين"],
  fr: ["Pièce en poterie", "Design marocain", "Création en terre"],
  en: ["Pottery piece", "Moroccan design", "Clay creation"],
};

export const DEFAULT_FEATURED_IMAGE =
  "/image/ikhtiyarat/tasmim%20mn%20tin.jpg";

export function localizedText(value, language) {
  return localizedContent(value, language);
}

export function normalizeLocalized(value) {
  return {
    ar: typeof value?.ar === "string" ? value.ar.trim() : "",
    fr: typeof value?.fr === "string" ? value.fr.trim() : "",
    en: typeof value?.en === "string" ? value.en.trim() : "",
  };
}

function hasLocalizedText(value) {
  return Boolean(value?.ar || value?.fr || value?.en);
}

export function normalizeFeaturedItems(items) {
  if (!Array.isArray(items) || items.length !== FEATURED_ITEM_IDS.length) {
    return [];
  }

  const normalized = FEATURED_ITEM_IDS.map((id, index) => ({
    id,
    title: normalizeLocalized(items[index]?.title),
    image: typeof items[index]?.image === "string" ? items[index].image.trim() : "",
  }));

  return normalized.every((item) => hasLocalizedText(item.title))
    ? normalized
    : [];
}

function buildLocalizedTitle(sectionName, product, index, language) {
  return (
    localizedText(sectionName, language) ||
    localizedText(product?.name, language) ||
    FEATURED_FALLBACK_NAMES[language]?.[index] ||
    ""
  );
}

export function buildFeaturedItems(featuredSection, products) {
  const section = featuredSection || {};
  const catalog = Array.isArray(products) ? products : [];
  const featuredProduct =
    catalog.find((product) => product.id === section.productId) || null;
  const otherProducts = catalog
    .filter((product) => product.id !== featuredProduct?.id)
    .slice(0, 2);

  const items = [
    {
      id: FEATURED_ITEM_IDS[0],
      image: section.image || featuredProduct?.image || DEFAULT_FEATURED_IMAGE,
      title: {
        ar: buildLocalizedTitle(section.productName, featuredProduct, 0, "ar"),
        fr: buildLocalizedTitle(section.productName, featuredProduct, 0, "fr"),
        en: buildLocalizedTitle(section.productName, featuredProduct, 0, "en"),
      },
    },
    ...otherProducts.map((product, index) => ({
      id: FEATURED_ITEM_IDS[index + 1],
      image: product.image || "",
      title: {
        ar: buildLocalizedTitle(null, product, index + 1, "ar"),
        fr: buildLocalizedTitle(null, product, index + 1, "fr"),
        en: buildLocalizedTitle(null, product, index + 1, "en"),
      },
    })),
  ];

  while (items.length < FEATURED_ITEM_IDS.length) {
    const index = items.length;

    items.push({
      id: FEATURED_ITEM_IDS[index],
      image: "",
      title: {
        ar: FEATURED_FALLBACK_NAMES.ar[index],
        fr: FEATURED_FALLBACK_NAMES.fr[index],
        en: FEATURED_FALLBACK_NAMES.en[index],
      },
    });
  }

  return items.slice(0, FEATURED_ITEM_IDS.length);
}

export function getFeaturedItems(featuredItems, featuredSection, products) {
  return normalizeFeaturedItems(featuredItems).length
    ? normalizeFeaturedItems(featuredItems)
    : buildFeaturedItems(featuredSection, products);
}

export function getDiscoveryPage(discoveryPages, itemId) {
  if (!Array.isArray(discoveryPages)) {
    return null;
  }

  return (
    discoveryPages.find((page) => page?.itemId === itemId) || null
  );
}

export function getDiscoveryBlocks(discoveryPages, itemId) {
  const page = getDiscoveryPage(discoveryPages, itemId);

  if (!page || !Array.isArray(page.blocks)) {
    return [];
  }

  return page.blocks
    .map((block) => ({
      id: typeof block?.id === "string" ? block.id : "",
      title: normalizeLocalized(block?.title),
      content: normalizeLocalized(block?.content),
      image: typeof block?.image === "string" ? block.image.trim() : "",
    }))
    .filter(
      (block) =>
        block.id &&
        (block.image || hasLocalizedText(block.title) || hasLocalizedText(block.content))
    );
}

export function makeBlockId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
