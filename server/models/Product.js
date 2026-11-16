import mongoose from "mongoose";

import { localizedSchema, variantSchema } from "./localizedSchema.js";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: localizedSchema, required: true },
    cardTitle: { type: localizedSchema, default: () => ({}) },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Mongoose reference to the Category document. `category` above stays the
    // human readable slug used by the existing frontend.
    categoryRef: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "", trim: true },
    // Optional gallery photos shown after the main image. The four fixed slots
    // are represented by empty strings when an administrator leaves a slot
    // unused, so the public page can hide empty slots without reordering.
    galleryImages: {
      type: [{ type: String, trim: true, maxlength: 500 }],
      default: [],
      validate: {
        validator: (images) => Array.isArray(images) && images.length <= 4,
        message: "A product can have at most four additional images.",
      },
    },
    images: { type: [variantSchema], default: [] },
    description: { type: localizedSchema, default: () => ({}) },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = result.productId;
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

productSchema.index({ category: 1, sortOrder: 1, createdAt: 1 });
productSchema.index({ categoryRef: 1, isActive: 1 });

export default mongoose.model("Product", productSchema);
