import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import products from "../src/data/products.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDir = path.join(serverDir, "data");

const productIds = new Set(products.map((product) => product.id));

const schema = `
  CREATE TABLE IF NOT EXISTS product_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT CHECK (review IS NULL OR length(review) <= 1000),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (product_id, customer_id)
  );

  CREATE INDEX IF NOT EXISTS idx_product_ratings_product_updated
    ON product_ratings (product_id, updated_at DESC);
`;

export function resolveDataDir(dataDir) {
  return path.resolve(
    dataDir || process.env.FAKHARA_DATA_DIR || defaultDataDir
  );
}

function mapReview(row) {
  return {
    id: Number(row.id),
    rating: Number(row.rating),
    review: row.review || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserRating(row) {
  if (!row) {
    return null;
  }

  return {
    rating: Number(row.rating),
    review: row.review || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isKnownProduct(productId) {
  return productIds.has(productId);
}

export function createRatingStore({ dataDir } = {}) {
  const resolvedDataDir = resolveDataDir(dataDir);
  mkdirSync(resolvedDataDir, { recursive: true });

  const database = new DatabaseSync(
    path.join(resolvedDataDir, "fakhara-ratings.sqlite")
  );

  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec(schema);

  const statisticsStatement = database.prepare(`
    SELECT
      COUNT(*) AS total,
      AVG(rating) AS average
    FROM product_ratings
    WHERE product_id = ?
  `);

  const reviewsStatement = database.prepare(`
    SELECT id, rating, review, created_at, updated_at
    FROM product_ratings
    WHERE product_id = ?
    ORDER BY updated_at DESC, id DESC
  `);

  const userRatingStatement = database.prepare(`
    SELECT rating, review, created_at, updated_at
    FROM product_ratings
    WHERE product_id = ? AND customer_id = ?
  `);

  const existingRatingStatement = database.prepare(`
    SELECT id
    FROM product_ratings
    WHERE product_id = ? AND customer_id = ?
  `);

  const upsertRatingStatement = database.prepare(`
    INSERT INTO product_ratings (
      product_id,
      customer_id,
      rating,
      review,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (product_id, customer_id) DO UPDATE SET
      rating = excluded.rating,
      review = excluded.review,
      updated_at = excluded.updated_at
  `);

  function getSummary(productId, customerId) {
    const statistics = statisticsStatement.get(productId);
    const total = Number(statistics?.total || 0);
    const average =
      total > 0 ? Math.round(Number(statistics.average) * 10) / 10 : null;

    return {
      productId,
      average,
      count: total,
      reviews: reviewsStatement.all(productId).map(mapReview),
      userRating: customerId
        ? mapUserRating(userRatingStatement.get(productId, customerId))
        : null,
    };
  }

  function saveRating({ productId, customerId, rating, review }) {
    const now = new Date().toISOString();
    const existing = existingRatingStatement.get(productId, customerId);

    upsertRatingStatement.run(
      productId,
      customerId,
      rating,
      review || null,
      now,
      now
    );

    return {
      created: !existing,
      summary: getSummary(productId, customerId),
    };
  }

  function close() {
    database.close();
  }

  return {
    getSummary,
    saveRating,
    close,
  };
}
