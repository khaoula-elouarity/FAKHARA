import mongoose from "mongoose";

import { localizedSchema } from "./localizedSchema.js";

const { Schema } = mongoose;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const TRACKING_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const orderItemVariantSchema = new Schema(
  {
    key: { type: String, default: "", trim: true },
    name: { type: localizedSchema, default: () => ({}) },
    image: { type: String, default: "", trim: true },
    price: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true, trim: true },
    // Mongoose reference to the ordered Product document.
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: localizedSchema, required: true },
    image: { type: String, default: "", trim: true },
    variant: { type: orderItemVariantSchema, default: null },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    postalCode: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, required: true, default: Date.now },
    source: {
      type: String,
      enum: ["system", "admin", "customer"],
      default: "system",
      required: true,
    },
    actor: { type: Schema.Types.ObjectId, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "An order must contain at least one item.",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = String(result._id);
        return result;
      },
    },
  }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
