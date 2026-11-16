import mongoose from "mongoose";

import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import ContactMessage from "../models/ContactMessage.js";
import CustomizationRequest from "../models/CustomizationRequest.js";
import Favorite from "../models/Favorite.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import env from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";

const MODELS = [
  ["Users", User],
  ["Admins", Admin],
  ["Categories", Category],
  ["Products", Product],
  ["Orders", Order],
  ["Reviews", Review],
  ["ContactMessages", ContactMessage],
  ["CustomizationRequests", CustomizationRequest],
  ["Favorites", Favorite],
];

async function main() {
  await connectDatabase();

  console.log(`\nFAKHARA database: ${env.mongoDbName}`);
  console.log(`Connection: ${mongoose.connection.name} @ ${mongoose.connection.host}:${mongoose.connection.port}`);
  console.log(`State: ${mongoose.connection.readyState === 1 ? "connected" : "not connected"}\n`);

  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();

  console.log(`Collections (${collections.length}):`);
  for (const collection of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await mongoose.connection.db
      .collection(collection.name)
      .estimatedDocumentCount();
    console.log(`  - ${collection.name.padEnd(24)} ${count} document(s)`);
  }

  console.log("\nDocuments by model:");
  for (const [label, model] of MODELS) {
    const count = await model.countDocuments();
    console.log(`  - ${label.padEnd(24)} ${count}`);
  }

  const categories = await Category.find().sort({ order: 1 });
  console.log("\nCategories:");
  for (const category of categories) {
    const products = await Product.countDocuments({ category: category.slug });
    console.log(
      `  - ${category.slug.padEnd(18)} ${String(products).padStart(2)} product(s)  ${category.name.en || ""}`
    );
  }

  console.log("\nProducts and variants:");
  const products = await Product.find().sort({ sortOrder: 1 });
  for (const product of products) {
    const variants = product.images || [];
    const variantSummary = variants
      .map((variant) => `${variant.key}(${variant.stock})`)
      .join(", ");
    console.log(
      `  - ${product.productId.padEnd(14)} ${String(variants.length).padStart(2)} variant(s)  ${variantSummary || "no variants"}`
    );
  }

  console.log("\nIndexes:");
  for (const [label, model] of MODELS) {
    const indexes = await model.collection.indexes();
    console.log(`  - ${label}: ${indexes.length} index(es)`);
  }

  console.log("");
}

main()
  .catch((error) => {
    console.error("Database check failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
