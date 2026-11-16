import mongoose from "mongoose";

import { DEFAULT_WHATSAPP_NUMBER } from "../utils/whatsapp.js";

const { Schema } = mongoose;

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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
