import mongoose from "mongoose";

const { Schema } = mongoose;

export const CONTACT_STATUSES = ["new", "read", "replied", "archived"];

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true, max: 20 },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      default: "new",
      index: true,
    },
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

contactMessageSchema.index({ createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
