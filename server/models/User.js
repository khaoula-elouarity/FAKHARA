import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const USER_ROLES = ["customer", "admin"];

const addressSchema = new Schema(
  {
    label: { type: String, default: "", trim: true },
    fullName: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    postalCode: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: { type: String, default: "", trim: true, index: true },
    // Hashed with bcrypt. Never selected by default and never returned by toJSON.
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    // Password reset: only the SHA-256 hash of the token is stored.
    resetPasswordTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "customer",
      index: true,
    },
    city: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    addresses: { type: [addressSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = String(result._id);
        delete result._id;
        delete result.__v;
        delete result.passwordHash;
        delete result.resetPasswordTokenHash;
        delete result.resetPasswordExpires;
        return result;
      },
    },
  }
);

userSchema.index({ phone: 1, email: 1 });
// A given email may only be registered once. Customers created by the
// checkout keep an empty email, so those records are excluded.
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string", $gt: "" } },
  }
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  if (!this.passwordHash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", userSchema);
