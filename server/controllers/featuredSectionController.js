import Product from "../models/Product.js";
import SiteSettings from "../models/SiteSettings.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  normalizeFeaturedSection,
  serializeFeaturedSection,
} from "../utils/featuredSection.js";
import { getOrCreateSettings } from "./settingsController.js";

function serializePayload(settings) {
  return {
    featuredSection: serializeFeaturedSection(settings.featuredSection),
    previousFeaturedSection: settings.featuredSectionPrevious
      ? serializeFeaturedSection(settings.featuredSectionPrevious)
      : null,
  };
}

async function assertFeaturedProduct(productId) {
  if (!productId) {
    return;
  }

  const product = await Product.findOne({
    productId,
    isActive: true,
  }).select("_id");

  if (!product) {
    throw ApiError.badRequest("invalid_featured_product", {
      field: "featuredSection.productId",
      message: "The selected product does not exist or is inactive.",
    });
  }
}

export const getAdminFeaturedSection = asyncHandler(
  async (_request, response) => {
    const settings = await getOrCreateSettings();

    response.set("Cache-Control", "no-store");
    response.json({
      success: true,
      ...serializePayload(settings),
    });
  }
);

export const updateAdminFeaturedSection = asyncHandler(
  async (request, response) => {
    const current = await getOrCreateSettings();
    const payload = normalizeFeaturedSection(
      request.body?.featuredSection ?? request.body
    );

    await assertFeaturedProduct(payload.productId);

    const previous = serializeFeaturedSection(current.featuredSection);
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          featuredSection: payload,
          featuredSectionPrevious: previous,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    response.json({
      success: true,
      ...serializePayload(settings),
    });
  }
);

export const restoreAdminFeaturedSection = asyncHandler(
  async (_request, response) => {
    const current = await getOrCreateSettings();

    if (!current.featuredSectionPrevious) {
      throw ApiError.badRequest("no_previous_featured_section");
    }

    const currentSnapshot = serializeFeaturedSection(current.featuredSection);
    const restored = serializeFeaturedSection(
      current.featuredSectionPrevious
    );
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          featuredSection: restored,
          featuredSectionPrevious: currentSnapshot,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    response.json({
      success: true,
      ...serializePayload(settings),
    });
  }
);

export default {
  getAdminFeaturedSection,
  updateAdminFeaturedSection,
  restoreAdminFeaturedSection,
};
