import Favorite from "../models/Favorite.js";
import Product from "../models/Product.js";
import env from "../config/env.js";
import { createCustomerSession } from "../customerSession.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const customerSession = createCustomerSession({ dataDir: env.dataDir });

async function readFavorites(customerId) {
  if (!customerId) {
    return [];
  }

  const favorites = await Favorite.find({ customerId })
    .sort({ createdAt: -1 })
    .select("productId");

  return favorites.map((favorite) => favorite.productId);
}

export const listFavorites = asyncHandler(async (request, response) => {
  const customerId = customerSession.readCustomerId(request);

  response.json({
    success: true,
    favorites: await readFavorites(customerId),
  });
});

export const addFavorite = asyncHandler(async (request, response) => {
  const { productId } = request.params;
  const product = await Product.findOne({
    productId,
    isActive: true,
  }).select("_id");

  if (!product) {
    throw ApiError.notFound("product_not_found");
  }

  const customerId = customerSession.ensureCustomer(request, response);

  await Favorite.findOneAndUpdate(
    { customerId, productId },
    {
      $setOnInsert: {
        customerId,
        productId,
        product: product._id,
        user: request.user?._id || null,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  response.status(201).json({
    success: true,
    favorites: await readFavorites(customerId),
  });
});

export const removeFavorite = asyncHandler(async (request, response) => {
  const customerId = customerSession.readCustomerId(request);
  const { productId } = request.params;

  if (customerId) {
    await Favorite.deleteOne({ customerId, productId });
  }

  response.json({
    success: true,
    favorites: await readFavorites(customerId),
  });
});
