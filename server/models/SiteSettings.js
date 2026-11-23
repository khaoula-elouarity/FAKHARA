import mongoose from "mongoose";

import { DEFAULT_WHATSAPP_NUMBER } from "../utils/whatsapp.js";
import { localizedSchema } from "./localizedSchema.js";

const { Schema } = mongoose;

const featuredSectionSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    label: { type: localizedSchema, default: () => ({}) },
    title: { type: localizedSchema, default: () => ({}) },
    description: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true, maxlength: 500 },
    productId: { type: String, default: "", trim: true, maxlength: 120 },
    productName: { type: localizedSchema, default: () => ({}) },
    productInformation: { type: localizedSchema, default: undefined },
    buttonText: { type: localizedSchema, default: () => ({}) },
    buttonLink: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false }
);

const featuredItemSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false }
);

const discoveryBlockSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: localizedSchema, default: () => ({}) },
    content: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false }
);

const discoveryPageSchema = new Schema(
  {
    itemId: { type: String, required: true, trim: true, maxlength: 120 },
    blocks: { type: [discoveryBlockSchema], default: [] },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      immutable: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      default: DEFAULT_WHATSAPP_NUMBER,
      trim: true,
      match: /^\d{8,15}$/,
    },
    homepage: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    featuredSection: {
      type: featuredSectionSchema,
      default: () => ({}),
    },
    // Snapshot of the section before the last save, used by the "restore
    // previous content" action in the admin dashboard.
    featuredSectionPrevious: {
      type: Schema.Types.Mixed,
      default: null,
    },
    featuredItems: {
      type: [featuredItemSchema],
      default: [],
    },
    discoveryPages: {
      type: [discoveryPageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
