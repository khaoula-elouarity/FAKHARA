import Product from "../models/Product.js";
import SiteSettings from "../models/SiteSettings.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  normalizeDiscoveryPages,
  normalizeFeaturedItems,
  serializeDiscoveryPages,
  serializeFeaturedItems,
} from "../utils/discovery.js";
import { getOrCreateSettings } from "./settingsController.js";

export const getAdminFeaturedItems = asyncHandler(async (_request, response) => {
  const settings = await getOrCreateSettings();

  response.set("Cache-Control", "no-store");
  response.json({
    success: true,
    featuredItems: serializeFeaturedItems(settings.featuredItems),
  });
});

export const updateAdminFeaturedItems = asyncHandler(async (request, response) => {
  const featuredItems = normalizeFeaturedItems(
    request.body?.featuredItems ?? request.body?.items ?? request.body
  );

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { featuredItems } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  const savedItems = serializeFeaturedItems(settings.featuredItems);

  await Promise.all(
    savedItems.map((item) => {
      const title = item.title || {};
      const hasTitle = Boolean(title.ar || title.fr || title.en);

      return Product.updateOne(
        { productId: item.id },
        {
          $set: {
            ...(hasTitle ? { name: title, cardTitle: title } : {}),
            ...(item.image ? { image: item.image } : {}),
            category: "featured",
            featured: true,
            isActive: true,
          },
        }
      );
    })
  );

  response.json({
    success: true,
    featuredItems: savedItems,
  });
});

export const getAdminDiscoveryPages = asyncHandler(async (_request, response) => {
  const settings = await getOrCreateSettings();

  response.set("Cache-Control", "no-store");
  response.json({
    success: true,
    discoveryPages: serializeDiscoveryPages(settings.discoveryPages),
  });
});

export const updateAdminDiscoveryPages = asyncHandler(async (request, response) => {
  const discoveryPages = normalizeDiscoveryPages(
    request.body?.discoveryPages ?? request.body?.pages ?? request.body
  );

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { discoveryPages } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  response.json({
    success: true,
    discoveryPages: serializeDiscoveryPages(settings.discoveryPages),
  });
});

export default {
  getAdminFeaturedItems,
  updateAdminFeaturedItems,
  getAdminDiscoveryPages,
  updateAdminDiscoveryPages,
};
