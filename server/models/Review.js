import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    productId: { type: String, required: true, trim: true, index: true },
    // Mongoose reference to the reviewed Product document.
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    // Anonymous visitor identifier (signed cookie) used for guests.
    customerId: { type: String, required: true, trim: true, index: true },
    // Mongoose reference to the registered customer, when the review was
    // written by a logged-in user.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "", trim: true, maxlength: 1000 },
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

reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, updatedAt: -1 });
reviewSchema.index({ user: 1, productId: 1 });

export default mongoose.model("Review", reviewSchema);
