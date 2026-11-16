import mongoose from "mongoose";

const { Schema } = mongoose;

export const localizedSchema = new Schema(
  {
    ar: { type: String, default: "", trim: true },
    fr: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false }
);

export const variantSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true },
    color: { type: String, default: "", trim: true },
    price: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

export default localizedSchema;
