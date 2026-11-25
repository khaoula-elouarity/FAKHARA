import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const ADMIN_ROLES = ["admin", "superadmin"];

export const ADMIN_PERMISSIONS = [
  "products:read",
  "products:write",
  "categories:read",
  "categories:write",
  "orders:read",
  "orders:write",
  "reviews:read",
  "contacts:read",
  "contacts:write",
  "customizations:read",
  "customizations:write",
  "customers:read",
];

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: "admin",
      index: true,
    },
    // Explicit capabilities of this administrator. The superadmin role
    // implicitly holds every permission.
    permissions: {
      type: [String],
      default: () => [...ADMIN_PERMISSIONS],
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        result.id = String(result._id);
        delete result.passwordHash;
        delete result.tokenVersion;
        delete result.__v;
        return result;
      },
    },
  }
);

adminSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

adminSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("Admin", adminSchema);
