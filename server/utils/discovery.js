import ApiError from "./ApiError.js";
import { readSafeUrl } from "./featuredSection.js";
import { readLocalized, readString } from "./validation.js";

export const FEATURED_ITEM_IDS = ["featured-1", "featured-2", "featured-3"];

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

function hasBlockContent(block) {
  return Boolean(
    block.image || hasLocalizedText(block.title) || hasLocalizedText(block.content)
  );
}

export function normalizeFeaturedItems(value) {
  if (!Array.isArray(value) || value.length !== FEATURED_ITEM_IDS.length) {
    throw ApiError.badRequest("invalid_featured_items", {
      field: "featuredItems",
      message: "Exactly three featured items are required.",
    });
  }

  return FEATURED_ITEM_IDS.map((id, index) => {
    const source =
      value[index] && typeof value[index] === "object" ? value[index] : {};
    const title = readLocalized(source.title, `featuredItemTitle${index + 1}`);

    if (!hasLocalizedText(title)) {
      throw ApiError.badRequest("invalid_featured_item_title", {
        field: `featuredItems.${index}.title`,
        message: "Enter a title for each featured item.",
      });
    }

    return {
      id,
      title,
      image: readSafeUrl(source.image, "featuredImage"),
    };
  });
}

export function serializeFeaturedItems(items) {
  if (!Array.isArray(items) || items.length !== FEATURED_ITEM_IDS.length) {
    return [];
  }

  const serialized = FEATURED_ITEM_IDS.map((id, index) => {
    const item = items[index];

    return {
      id,
      title: localizedOrEmpty(item?.title),
      image: typeof item?.image === "string" ? item.image.trim() : "",
    };
  });

  return serialized.every((item) => hasLocalizedText(item.title))
    ? serialized
    : [];
}

export function normalizeDiscoveryPages(value) {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest("invalid_discovery_pages", {
      field: "discoveryPages",
      message: "Discovery pages must be an array.",
    });
  }

  const pages = [];
  const seenItems = new Set();

  value.forEach((page, pageIndex) => {
    if (!page || typeof page !== "object" || Array.isArray(page)) {
      return;
    }

    const itemId = readString(page.itemId, "discoveryItemId", {
      required: false,
      max: 120,
    });

    if (!FEATURED_ITEM_IDS.includes(itemId)) {
      throw ApiError.badRequest("invalid_discovery_item", {
        field: `discoveryPages.${pageIndex}.itemId`,
        message: "The selected featured item does not exist.",
      });
    }

    if (seenItems.has(itemId)) {
      throw ApiError.badRequest("duplicate_discovery_item", {
        field: `discoveryPages.${pageIndex}.itemId`,
        message: "Each featured item can have one discovery page.",
      });
    }

    seenItems.add(itemId);

    if (!Array.isArray(page.blocks) || page.blocks.length > 50) {
      throw ApiError.badRequest("invalid_discovery_blocks", {
        field: `discoveryPages.${pageIndex}.blocks`,
        message: "A discovery page can contain up to 50 sections.",
      });
    }

    const blockIds = new Set();
    const blocks = page.blocks
      .map((block, blockIndex) => {
        if (!block || typeof block !== "object" || Array.isArray(block)) {
          return null;
        }

        const id = readString(block.id, "discoveryBlockId", {
          required: true,
          max: 120,
        });

        if (blockIds.has(id)) {
          throw ApiError.badRequest("duplicate_discovery_block", {
            field: `discoveryPages.${pageIndex}.blocks.${blockIndex}.id`,
            message: "Section identifiers must be unique.",
          });
        }

        blockIds.add(id);

        return {
          id,
          title: readLocalized(block.title, "discoveryBlockTitle"),
          content: readLocalized(block.content, "discoveryBlockContent"),
          image: readSafeUrl(block.image, "featuredImage"),
        };
      })
      .filter((block) => block && hasBlockContent(block));

    pages.push({ itemId, blocks });
  });

  return pages;
}

export function serializeDiscoveryPages(pages) {
  if (!Array.isArray(pages)) {
    return [];
  }

  return pages
    .filter((page) => FEATURED_ITEM_IDS.includes(page?.itemId))
    .map((page) => ({
      itemId: page.itemId,
      blocks: Array.isArray(page.blocks)
        ? page.blocks
            .filter((block) => block && hasBlockContent(block))
            .map((block) => ({
              id: typeof block.id === "string" ? block.id : "",
              title: localizedOrEmpty(block.title),
              content: localizedOrEmpty(block.content),
              image: typeof block.image === "string" ? block.image.trim() : "",
            }))
            .filter((block) => block.id)
        : [],
    }));
}

export default {
  FEATURED_ITEM_IDS,
  normalizeFeaturedItems,
  serializeFeaturedItems,
  normalizeDiscoveryPages,
  serializeDiscoveryPages,
};
