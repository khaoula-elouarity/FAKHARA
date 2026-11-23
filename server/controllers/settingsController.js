import SiteSettings from "../models/SiteSettings.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  serializeDiscoveryPages,
  serializeFeaturedItems,
} from "../utils/discovery.js";
import { serializeFeaturedSection } from "../utils/featuredSection.js";
import { normalizeHomepage, serializeHomepage } from "../utils/homepage.js";
import {
  DEFAULT_WHATSAPP_NUMBER,
  normalizeWhatsAppNumber,
  serializeWhatsAppSettings,
} from "../utils/whatsapp.js";

export async function getOrCreateSettings() {
  const existing = await SiteSettings.findOne({ key: "default" });

  if (existing) {
    return existing;
  }

  try {
    return await SiteSettings.create({
      key: "default",
      whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
    });
  } catch (error) {
    // A concurrent first request may have created the singleton already.
    if (error?.code === 11000) {
      return SiteSettings.findOne({ key: "default" });
    }

    throw error;
  }
}

export const getPublicSettings = asyncHandler(async (_request, response) => {
  const settings = await getOrCreateSettings();

  response.set("Cache-Control", "no-store");
  response.json({
    success: true,
    settings: {
      ...serializeWhatsAppSettings(settings),
      homepage: serializeHomepage(settings.homepage),
      featuredSection: serializeFeaturedSection(settings.featuredSection),
      featuredItems: serializeFeaturedItems(settings.featuredItems),
      discoveryPages: serializeDiscoveryPages(settings.discoveryPages),
    },
  });
});

export const getAdminSettings = asyncHandler(async (_request, response) => {
  const settings = await getOrCreateSettings();

  response.set("Cache-Control", "no-store");
  response.json({
    success: true,
    settings: {
      ...serializeWhatsAppSettings(settings),
      homepage: serializeHomepage(settings.homepage),
      featuredSection: serializeFeaturedSection(settings.featuredSection),
      featuredItems: serializeFeaturedItems(settings.featuredItems),
      discoveryPages: serializeDiscoveryPages(settings.discoveryPages),
    },
  });
});

export const updateAdminSettings = asyncHandler(async (request, response) => {
  const whatsappNumber = normalizeWhatsAppNumber(
    request.body?.whatsappNumber
  );

  if (!whatsappNumber) {
    throw ApiError.badRequest("invalid_whatsapp_number", {
      field: "whatsappNumber",
      message:
        "Enter a valid WhatsApp number in international format, for example +212649613615.",
    });
  }

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { whatsappNumber } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  response.json({
    success: true,
    settings: serializeWhatsAppSettings(settings),
  });
});

export const updateAdminHomepage = asyncHandler(async (request, response) => {
  const homepage = normalizeHomepage(request.body);

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { homepage } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  response.json({
    success: true,
    homepage: serializeHomepage(settings.homepage),
  });
});
