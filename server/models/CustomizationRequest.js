import mongoose from "mongoose";

const { Schema } = mongoose;

export const CUSTOMIZATION_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

const customizationCustomerSchema = new Schema(
  {
    fullName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const customizationRequestSchema = new Schema(
  {
    product: { type: String, required: true, trim: true },
    // Mongoose reference to the Product being customized, when it matches one.
    productRef: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    color: { type: String, required: true, trim: true },
    decoration: { type: String, required: true, trim: true },
    customText: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    quantity: { type: Number, default: 1, min: 1, max: 50 },
    language: {
      type: String,
      enum: ["ar", "fr", "en"],
      default: "ar",
    },
    // Customer details, filled in when the visitor provides them.
    customer: { type: customizationCustomerSchema, default: () => ({}) },
    // Mongoose reference to the registered customer, when applicable.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    // Path or URL of an uploaded inspiration image for the custom piece.
    referenceImage: { type: String, default: "", trim: true, max: 500 },
    status: {
      type: String,
      enum: CUSTOMIZATION_STATUSES,
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = String(result._id);
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

customizationRequestSchema.index({ createdAt: -1 });
customizationRequestSchema.index({ status: 1, createdAt: -1 });
customizationRequestSchema.index({ "customer.email": 1, createdAt: -1 });

export default mongoose.model(
  "CustomizationRequest",
  customizationRequestSchema
);
