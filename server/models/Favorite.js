import mongoose from "mongoose";

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    customerId: { type: String, required: true, trim: true, index: true },
    // Mongoose reference to the registered customer, when the favorite was
    // added by a logged-in user.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    productId: { type: String, required: true, trim: true, index: true },
    // Mongoose reference to the favorited Product document.
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
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

favoriteSchema.index({ customerId: 1, productId: 1 }, { unique: true });
favoriteSchema.index({ user: 1, productId: 1 });

export default mongoose.model("Favorite", favoriteSchema);
