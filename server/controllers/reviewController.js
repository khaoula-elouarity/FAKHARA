import Product from "../models/Product.js";
import Review from "../models/Review.js";
import env from "../config/env.js";
import { createCustomerSession } from "../customerSession.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const customerSession = createCustomerSession({ dataDir: env.dataDir });
const MAX_REVIEW_LENGTH = 1000;

async function ensureProductExists(productId) {
  const exists = await Product.exists({ productId, isActive: true });

  if (!exists) {
    throw ApiError.notFound("product_not_found");
  }
}

async function buildSummary(productId, customerId) {
  const [statistics, reviews, userRating] = await Promise.all([
    Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          average: { $avg: "$rating" },
        },
      },
    ]),
    Review.find({ productId }).sort({ updatedAt: -1 }).limit(100),
    customerId
      ? Review.findOne({ productId, customerId })
      : Promise.resolve(null),
  ]);

  const stats = statistics[0];
  const count = stats?.count || 0;

  return {
    productId,
    average:
      count > 0 ? Math.round(Number(stats.average) * 10) / 10 : null,
    count,
    reviews: reviews.map((review) => ({
      id: String(review._id),
      rating: review.rating,
      review: review.review || "",
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    })),
    userRating: userRating
      ? {
          rating: userRating.rating,
          review: userRating.review || "",
          createdAt: userRating.createdAt,
          updatedAt: userRating.updatedAt,
        }
      : null,
  };
}

export const getProductReviews = asyncHandler(async (request, response) => {
  const { productId } = request.params;
  await ensureProductExists(productId);

  const customerId = customerSession.readCustomerId(request);
  const summary = await buildSummary(productId, customerId);

  response.json(summary);
});
export const createProductReview = asyncHandler(async (request, response) => {
  const { productId } = request.params;
  await ensureProductExists(productId);

  if (
    !Number.isInteger(request.body?.rating) ||
    request.body.rating < 1 ||
    request.body.rating > 5
  ) {
    throw ApiError.badRequest("invalid_rating");
  }

  let review = "";

  if (request.body?.review !== undefined && request.body.review !== null) {
    if (typeof request.body.review !== "string") {
      throw ApiError.badRequest("invalid_review");
    }

    review = request.body.review.trim();

    if (review.length > MAX_REVIEW_LENGTH) {
      throw ApiError.badRequest("invalid_review");
    }
  }

  const customerId = customerSession.ensureCustomer(request, response);
  const existing = await Review.findOne({ productId, customerId });
  const product = await Product.findOne({ productId }).select("_id");

  await Review.findOneAndUpdate(
    { productId, customerId },
    {
      $set: {
        rating: request.body.rating,
        review,
        product: product?._id || null,
        user: request.user?._id || null,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  const summary = await buildSummary(productId, customerId);

  response.status(existing ? 200 : 201).json(summary);
});
