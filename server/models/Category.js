import mongoose from "mongoose";

import { localizedSchema } from "./localizedSchema.js";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: localizedSchema, required: true },
    description: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true },
    // Products belonging to this category. Kept in sync by the product and
    // category controllers whenever a product is created, moved or deleted.
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = result.slug;
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

categorySchema.index({ order: 1, createdAt: 1 });

export default mongoose.model("Category", categorySchema);
