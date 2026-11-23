import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toCategorySlug } from "../utils/slug.js";
import { removeUploadedImage } from "../utils/uploads.js";
import {
  readBoolean,
  readLocalized,
  readNumber,
  readString,
} from "../utils/validation.js";

function normalizeCategory(body) {
  const name = readLocalized(body?.name, "name", { required: true });
  const requestedSlug = readString(body?.slug, "slug", {
    required: false,
    max: 120,
  });
  const slug =
    toCategorySlug(requestedSlug) ||
    toCategorySlug(name.en || name.fr || name.ar);

  if (!slug) {
    throw ApiError.badRequest("invalid_slug", {
      field: "slug",
      message: "A category slug is required.",
    });
  }

  return {
    slug,
    name,
    description: readLocalized(body?.description, "description"),
    image: readString(body?.image, "image", {
      required: false,
      max: 500,
    }),
    order: readNumber(body?.order, "order", {
      required: false,
      fallback: 0,
    }),
    isActive: readBoolean(body?.isActive, true),
  };
}

export const listCategories = asyncHandler(async (request, response) => {
  const filter = request.admin ? {} : { isActive: true };
  const categories = await Category.find(filter)
    .sort({
      order: 1,
      createdAt: 1,
    })
    .populate("products", "productId name price image isActive");

  response.json({
    success: true,
    categories: categories.map((category) => category.toJSON()),
  });
});

export const createCategory = asyncHandler(async (request, response) => {
  const payload = normalizeCategory(request.body);

  const existing = await Category.findOne({ slug: payload.slug });

  if (existing) {
    throw ApiError.conflict("category_slug_already_exists");
  }

  const category = new Category(payload);
  await category.save();

  response.status(201).json({
    success: true,
    category: category.toJSON(),
  });
});

export const updateCategory = asyncHandler(async (request, response) => {
  const payload = normalizeCategory(request.body);
  const category = await Category.findOne({
    slug: request.params.categoryId,
  });

  if (!category) {
    throw ApiError.notFound("category_not_found");
  }

  if (payload.slug !== category.slug) {
    const duplicate = await Category.findOne({ slug: payload.slug });

    if (duplicate) {
      throw ApiError.conflict("category_slug_already_exists");
    }

    await Product.updateMany(
      { category: category.slug },
      { $set: { category: payload.slug, categoryRef: category._id } }
    );
  }

  const previousImage = category.image;

  Object.assign(category, payload);
  await category.save();

  if (previousImage && previousImage !== category.image) {
    await removeUploadedImage(previousImage);
  }

  response.json({
    success: true,
    category: category.toJSON(),
  });
});

export const deleteCategory = asyncHandler(async (request, response) => {
  const category = await Category.findOne({
    slug: request.params.categoryId,
  });

  if (!category) {
    throw ApiError.notFound("category_not_found");
  }

  const productCount = await Product.countDocuments({
    category: category.slug,
  });
  const reassignTo = readString(
    request.body?.reassignTo ?? request.query?.reassignTo,
    "reassignTo",
    { required: false, max: 120 }
  );

  if (productCount > 0 && !reassignTo) {
    throw ApiError.conflict("category_has_products", {
      productCount,
    });
  }

  let reassignedProductCount = 0;

  if (productCount > 0) {
    const targetCategory = await Category.findOne({ slug: reassignTo });

    if (!targetCategory || targetCategory.slug === category.slug) {
      throw ApiError.badRequest("invalid_reassign_category", {
        field: "reassignTo",
        message: "Choose an existing collection to receive the products.",
      });
    }

    const productIds = await Product.find({
      category: category.slug,
    }).distinct("_id");

    await Product.updateMany(
      { category: category.slug },
      {
        $set: {
          category: targetCategory.slug,
          categoryRef: targetCategory._id,
        },
      }
    );

    if (productIds.length > 0) {
      await Category.updateOne(
        { _id: targetCategory._id },
        { $addToSet: { products: { $each: productIds } } }
      );
    }

    reassignedProductCount = productIds.length;
  }

  const image = category.image;
  await category.deleteOne();
  await removeUploadedImage(image);

  response.json({
    success: true,
    deletedCategoryId: category.slug,
    reassignedProductCount,
    reassignTo: reassignedProductCount > 0 ? reassignTo : null,
  });
});
