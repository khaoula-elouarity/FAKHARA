import { existsSync } from "node:fs";
import path from "node:path";

import ContactMessage from "../models/ContactMessage.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import env from "../config/env.js";

async function readLegacyDatabase(fileName, table) {
  const filePath = path.join(env.dataDir, fileName);

  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const { DatabaseSync } = await import("node:sqlite");
    const database = new DatabaseSync(filePath);

    try {
      return database.prepare(`SELECT * FROM ${table}`).all();
    } finally {
      database.close();
    }
  } catch (error) {
    console.warn(
      `Could not read legacy database ${fileName}: ${error.message}`
    );
    return [];
  }
}

export async function migrateLegacyData() {
  if ((await ContactMessage.countDocuments()) === 0) {
    const messages = await readLegacyDatabase(
      "fakhara-contact.sqlite",
      "contact_messages"
    );

    if (messages.length > 0) {
      await ContactMessage.collection.insertMany(
        messages.map((row) => ({
          name: row.name,
          email: row.email,
          subject: row.subject,
          message: row.message,
          status: row.status || "new",
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.created_at),
        }))
      );

      console.log(`Migrated ${messages.length} contact messages from SQLite.`);
    }
  }

  if ((await Review.countDocuments()) === 0) {
    const reviews = await readLegacyDatabase(
      "fakhara-ratings.sqlite",
      "product_ratings"
    );

    if (reviews.length > 0) {
      await Review.collection.insertMany(
        reviews.map((row) => ({
          productId: row.product_id,
          customerId: row.customer_id,
          rating: Number(row.rating),
          review: row.review || "",
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        }))
      );

      console.log(`Migrated ${reviews.length} reviews from SQLite.`);
    }
  }

  await backfillReviewReferences();
  await backfillOrderStatusHistory();
}

/**
 * Fills the product and user references on reviews that were created before
 * those references existed, or imported from the legacy SQLite database.
 */
async function backfillReviewReferences() {
  const reviews = await Review.find({
    $or: [{ product: null }, { user: null }],
  });

  if (reviews.length === 0) {
    return;
  }

  const productIds = [...new Set(reviews.map((review) => review.productId))];
  const products = await Product.find({ productId: { $in: productIds } }).select(
    "_id productId"
  );
  const productMap = new Map(
    products.map((product) => [product.productId, product._id])
  );

  // Legacy reviews use the anonymous visitor id, which is not a User
  // document, so only the product reference can be resolved for them.
  for (const review of reviews) {
    const productId = productMap.get(review.productId);

    if (productId && !review.product) {
      review.product = productId;
    }
  }

  await Review.bulkWrite(
    reviews
      .filter((review) => review.isModified("product"))
      .map((review) => ({
        updateOne: {
          filter: { _id: review._id },
          update: { $set: { product: review.product } },
        },
      }))
  );

  console.log(`Linked ${reviews.length} review(s) to their product.`);
}

async function backfillOrderStatusHistory() {
  const orders = await Order.find({
    $or: [{ statusHistory: { $exists: false } }, { statusHistory: { $size: 0 } }],
  }).lean();

  if (orders.length === 0) {
    return;
  }

  const operations = orders.map((order) => {
    const createdAt = order.createdAt || order.updatedAt || new Date();
    const history = [
      { status: "pending", at: createdAt, source: "system", actor: null },
    ];

    if (order.status && order.status !== "pending") {
      history.push({
        status: order.status,
        at: order.updatedAt || createdAt,
        source: "system",
        actor: null,
      });
    }

    return {
      updateOne: {
        filter: { _id: order._id },
        update: { $set: { statusHistory: history } },
      },
    };
  });

  await Order.bulkWrite(operations);
  console.log(`Backfilled status history for ${orders.length} order(s).`);
}

export default migrateLegacyData;
