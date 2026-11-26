import Category from "../models/Category.js";
import Favorite from "../models/Favorite.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  buildSearchTokenPattern,
  normalizeSearchText,
  searchTokens,
} from "../utils/productSearch.js";
import { toVariantKey } from "../utils/slug.js";
import { removeUploadedImages } from "../utils/uploads.js";
import {
  readBoolean,
  readLocalized,
  readNumber,
  readString,
  readStringArray,
} from "../utils/validation.js";

const MAX_GALLERY_IMAGES = 4;
const DEFAULT_SEARCH_LIMIT = 8;
const MAX_SEARCH_LIMIT = 20;
const MAX_SEARCH_CANDIDATES = 80;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localizedValues(value) {
  if (!value) {
    return [];
  }

  return ["ar", "fr", "en"]
    .map((language) => value[language])
    .filter(Boolean);
}

function categorySearchText(category) {
  return normalizeSearchText(
    [
      category.slug,
      ...localizedValues(category.name),
      ...localizedValues(category.description),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function productSearchImage(product) {
  return (
    product.image ||
    (Array.isArray(product.galleryImages)
      ? product.galleryImages.find(Boolean)
      : "") ||
    (Array.isArray(product.images)
      ? product.images.map((variant) => variant.image).find(Boolean)
      : "") ||
    ""
  );
}

function productSearchScore(product, category, query, tokens) {
  const nameText = normalizeSearchText(
    localizedValues(product.name).join(" ")
  );
  const cardTitleText = normalizeSearchText(
    localizedValues(product.cardTitle).join(" ")
  );
  const descriptionText = normalizeSearchText(
    localizedValues(product.description).join(" ")
  );
  const categoryText = normalizeSearchText(
    [
      product.category,
      ...localizedValues(category?.name),
      ...localizedValues(category?.description),
    ]
      .filter(Boolean)
      .join(" ")
  );
  const variantText = normalizeSearchText(
    (Array.isArray(product.images) ? product.images : [])
      .flatMap((variant) => [
        variant.color,
        ...localizedValues(variant.name),
      ])
      .filter(Boolean)
      .join(" ")
  );
  const productIdText = normalizeSearchText(product.productId);
  const combinedText = [
    nameText,
    cardTitleText,
    descriptionText,
    categoryText,
    variantText,
    productIdText,
  ].join(" ");
  const hasEveryToken = tokens.every((token) =>
    combinedText.includes(token)
  );

  let score = hasEveryToken ? 5 : 0;

  if (nameText === query) {
    score += 120;
  } else if (nameText.startsWith(query)) {
    score += 80;
  } else if (nameText.includes(query)) {
    score += 60;
  } else if (tokens.every((token) => nameText.includes(token))) {
    score += 35;
  }

  if (categoryText.includes(query)) {
    score += 38;
  } else if (tokens.every((token) => categoryText.includes(token))) {
    score += 24;
  }

  if (cardTitleText.includes(query)) {
    score += 28;
  } else if (
    tokens.every((token) => cardTitleText.includes(token))
  ) {
    score += 16;
  }

  if (descriptionText.includes(query)) {
    score += 14;
  } else if (
    tokens.every((token) => descriptionText.includes(token))
  ) {
    score += 8;
  }

  if (variantText.includes(query)) {
    score += 16;
  } else if (tokens.every((token) => variantText.includes(token))) {
    score += 9;
  }

  if (productIdText.includes(query)) {
    score += 30;
  }

  return score;
}

function searchLimit(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(parsed, 1), MAX_SEARCH_LIMIT);
}

function productImageUrls(product) {
  return [
    product.image,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
    ...(Array.isArray(product.images)
      ? product.images.map((variant) => variant.image)
      : []),
  ].filter(Boolean);
}

function normalizeGalleryImages(value) {
  const slots = readStringArray(value, "galleryImages", MAX_GALLERY_IMAGES).map(
    (image, index) =>
      readString(image, `galleryImages.${index}`, {
        required: false,
        max: 500,
      })
  );
  const usedImages = new Set();

  for (const image of slots) {
    if (!image) {
      continue;
    }

    if (usedImages.has(image)) {
      throw ApiError.badRequest("duplicate_gallery_image", {
        field: "galleryImages",
        message: "Additional images must be unique.",
      });
    }

    usedImages.add(image);
  }

  return slots;
}

function normalizeVariant(value, index) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const image = readString(source.image, "variant.image", {
    required: false,
    max: 500,
  });
  let key = readString(source.key, "variant.key", {
    required: false,
    max: 120,
  });

  if (!key) {
    key = toVariantKey(image, index);
  }

  const price =
    source.price === undefined || source.price === null || source.price === ""
      ? null
      : readNumber(source.price, "variant.price", {
          required: false,
          min: 0,
        });

  return {
    key,
    name: readLocalized(source.name, "variant.name"),
    image,
    color: readString(source.color, "variant.color", {
      required: false,
      max: 80,
    }),
    price,
    stock: readNumber(source.stock, "variant.stock", {
      required: false,
      min: 0,
      fallback: 0,
    }),
  };
}

function normalizeProduct(
  body,
  {
    requireAll = true,
    fallbackGalleryImages = [],
    fallbackSortOrder = 0,
  } = {}
) {
  const productId = readString(
    body?.productId ?? body?.id,
    "productId",
    requireAll ? { max: 120 } : { required: false, max: 120 }
  );
  const name = readLocalized(body?.name, "name", {
    required: requireAll,
  });
  if (requireAll && !name.ar) {
    throw ApiError.badRequest("invalid_name_ar", {
      field: "name.ar",
      message: "Arabic product name is required.",
    });
  }
  const cardTitle = readLocalized(body?.cardTitle, "cardTitle");
  const category = readString(body?.category, "category", {
    required: requireAll,
    max: 120,
  });
  const price = readNumber(body?.price, "price", {
    required: requireAll,
    min: 0,
  });
  const image = readString(body?.image, "image", {
    required: false,
    max: 500,
  });
  const description = readLocalized(body?.description, "description");

  // Clients that predate the four additional image slots must not erase them
  // when editing an existing product.
  const hasGalleryImages =
    body?.galleryImages !== undefined || body?.additionalImages !== undefined;
  const galleryImages = hasGalleryImages
    ? normalizeGalleryImages(body?.galleryImages ?? body?.additionalImages)
    : fallbackGalleryImages;

  const variantsSource = Array.isArray(body?.images)
    ? body.images
    : Array.isArray(body?.variants)
      ? body.variants
      : [];
  const images = readStringArray(variantsSource, "images", 50).map(
    normalizeVariant
  );

  const keys = new Set();

  for (const variant of images) {
    if (!variant.key || keys.has(variant.key)) {
      throw ApiError.badRequest("invalid_variant_keys", {
        field: "images",
        message: "Variant keys must be unique and non-empty.",
      });
    }

    keys.add(variant.key);
  }

  return {
    productId,
    name,
    cardTitle,
    category,
    price,
    image,
    galleryImages,
    images,
    description,
    stock: readNumber(body?.stock, "stock", {
      required: false,
      min: 0,
      fallback: 0,
    }),
    isActive: readBoolean(body?.isActive, true),
    featured: readBoolean(body?.featured, false),
    sortOrder: readNumber(body?.sortOrder, "sortOrder", {
      required: false,
      fallback: fallbackSortOrder,
    }),
  };
}

async function resolveCategory(slug) {
  if (slug === "featured") {
    return { _id: null, slug };
  }

  const category = await Category.findOne({ slug });

  if (!category) {
    throw ApiError.badRequest("invalid_category", {
      field: "category",
      message: "The selected category does not exist.",
    });
  }

  return category;
}

/**
 * Keeps Category.products in sync with the products it contains.
 */
async function syncCategoryProducts(categorySlug, productId, { add }) {
  if (!categorySlug || !productId) {
    return;
  }

  const update = add
    ? { $addToSet: { products: productId } }
    : { $pull: { products: productId } };

  await Category.updateOne({ slug: categorySlug }, update);
}

export const searchProducts = asyncHandler(async (request, response) => {
  const rawQuery =
    typeof request.query.q === "string" ? request.query.q : "";
  const query = rawQuery.trim().slice(0, 120);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    response.json({
      success: true,
      query,
      products: [],
      count: 0,
      total: 0,
    });
    return;
  }

  const tokens = searchTokens(normalizedQuery);
  const limit = searchLimit(request.query.limit);
  const categories = await Category.find({ isActive: true })
    .select("slug name description")
    .lean();
  const categoryBySlug = new Map(
    categories.map((category) => [category.slug, category])
  );
  const categoryTexts = new Map(
    categories.map((category) => [
      category.slug,
      categorySearchText(category),
    ])
  );

  const tokenConditions = tokens.map((token) => {
    const regex = new RegExp(buildSearchTokenPattern(token), "i");
    const matchingCategories = categories.filter((category) =>
      categoryTexts.get(category.slug).includes(token)
    );
    const conditions = [
      { "name.ar": regex },
      { "name.fr": regex },
      { "name.en": regex },
      { "cardTitle.ar": regex },
      { "cardTitle.fr": regex },
      { "cardTitle.en": regex },
      { "description.ar": regex },
      { "description.fr": regex },
      { "description.en": regex },
      { productId: regex },
      { "images.name.ar": regex },
      { "images.name.fr": regex },
      { "images.name.en": regex },
      { "images.color": regex },
    ];

    if (matchingCategories.length > 0) {
      conditions.push({
        category: {
          $in: matchingCategories.map((category) => category.slug),
        },
      });
      conditions.push({
        categoryRef: {
          $in: matchingCategories.map((category) => category._id),
        },
      });
    }

    return { $or: conditions };
  });

  const products = await Product.find({
    isActive: true,
    $and: tokenConditions,
  })
    .select(
      "productId name cardTitle category price image galleryImages images description sortOrder createdAt"
    )
    .sort({ sortOrder: 1, createdAt: 1 })
    .limit(MAX_SEARCH_CANDIDATES)
    .lean();

  const scoredProducts = products
    .map((product) => {
      const category = categoryBySlug.get(product.category);
      const score = productSearchScore(
        product,
        category,
        normalizedQuery,
        tokens
      );

      return {
        id: product.productId,
        productId: product.productId,
        name: product.name,
        category: product.category,
        categoryName:
          category?.name || {
            ar: product.category,
            fr: product.category,
            en: product.category,
          },
        price: product.price,
        image: productSearchImage(product),
        score,
        sortOrder: product.sortOrder || 0,
        createdAt: product.createdAt,
      };
    })
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.sortOrder - second.sortOrder ||
        new Date(first.createdAt) - new Date(second.createdAt)
    );

  const total = scoredProducts.length;
  const results = scoredProducts.slice(0, limit).map(
    ({ score: _score, sortOrder: _sortOrder, createdAt: _createdAt, ...product }) =>
      product
  );

  response.json({
    success: true,
    query,
    products: results,
    count: results.length,
    total,
  });
});

export const listProducts = asyncHandler(async (request, response) => {
  const filter = { isActive: true };

  if (request.query.category) {
    filter.category = String(request.query.category);
  }

  if (request.query.featured === "true") {
    filter.featured = true;
  }

  if (request.query.q) {
    const search = new RegExp(escapeRegex(String(request.query.q)), "i");
    filter.$or = [
      { "name.ar": search },
      { "name.fr": search },
      { "name.en": search },
      { productId: search },
    ];
  }

  const products = await Product.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });

  response.json({
    success: true,
    products: products.map((product) => product.toJSON()),
  });
});

export const getProduct = asyncHandler(async (request, response) => {
  const product = await Product.findOne({
    productId: request.params.productId,
    isActive: true,
  });

  if (!product) {
    throw ApiError.notFound("product_not_found");
  }

  response.json({
    success: true,
    product: product.toJSON(),
  });
});

export const listAdminProducts = asyncHandler(async (request, response) => {
  const filter = {};

  if (request.query.category) {
    filter.category = String(request.query.category);
  }

  if (request.query.q) {
    const search = new RegExp(escapeRegex(String(request.query.q)), "i");
    filter.$or = [
      { "name.ar": search },
      { "name.fr": search },
      { "name.en": search },
      { productId: search },
    ];
  }

  const products = await Product.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });

  response.json({
    success: true,
    products: products.map((product) => product.toJSON()),
  });
});

export const createProduct = asyncHandler(async (request, response) => {
  const payload = normalizeProduct(request.body);
  const category = await resolveCategory(payload.category);

  const existing = await Product.findOne({ productId: payload.productId });

  if (existing) {
    throw ApiError.conflict("product_id_already_exists");
  }

  const product = new Product({
    ...payload,
    categoryRef: category._id,
  });

  await product.save();
  await syncCategoryProducts(category.slug, product._id, { add: true });

  response.status(201).json({
    success: true,
    product: product.toJSON(),
  });
});

export const updateProduct = asyncHandler(async (request, response) => {
  const product = await Product.findOne({
    productId: request.params.productId,
  });

  if (!product) {
    throw ApiError.notFound("product_not_found");
  }

  const payload = normalizeProduct(request.body, {
    fallbackGalleryImages: product.galleryImages || [],
    fallbackSortOrder: product.sortOrder || 0,
  });
  const category = await resolveCategory(payload.category);

  if (payload.productId !== product.productId) {
    const duplicate = await Product.findOne({
      productId: payload.productId,
      _id: { $ne: product._id },
    });

    if (duplicate) {
      throw ApiError.conflict("product_id_already_exists");
    }
  }

  const previousCategory = product.category;
  const previousCategoryRef = product.categoryRef;
  const previousImages = productImageUrls(product);

  Object.assign(product, payload);
  product.categoryRef = category._id;

  await product.save();

  const nextImages = new Set(productImageUrls(product));
  await removeUploadedImages(
    previousImages.filter((url) => !nextImages.has(url))
  );

  if (previousCategory !== category.slug) {
    await syncCategoryProducts(previousCategory, product._id, { add: false });
    await syncCategoryProducts(category.slug, product._id, { add: true });
  } else if (!previousCategoryRef) {
    await syncCategoryProducts(category.slug, product._id, { add: true });
  }

  response.json({
    success: true,
    product: product.toJSON(),
  });
});

export const deleteProduct = asyncHandler(async (request, response) => {
  const product = await Product.findOneAndDelete({
    productId: request.params.productId,
  });

  if (!product) {
    throw ApiError.notFound("product_not_found");
  }

  await Promise.all([
    Review.deleteMany({ productId: product.productId }),
    Favorite.deleteMany({ productId: product.productId }),
    syncCategoryProducts(product.category, product._id, { add: false }),
  ]);
  await removeUploadedImages(productImageUrls(product));

  response.json({
    success: true,
    deletedProductId: product.productId,
  });
});
