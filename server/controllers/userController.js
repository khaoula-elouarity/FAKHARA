import { createHash, randomBytes } from "node:crypto";

import Admin, { ADMIN_ROLES } from "../models/Admin.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendPasswordResetEmail from "../utils/mailer.js";
import {
  clearAdminSession,
  setAdminSessionCookie,
} from "../middleware/auth.js";
import {
  USER_COOKIE_NAME,
  USER_COOKIE_OPTIONS,
  signUserToken,
} from "../middleware/userAuth.js";
import {
  readBoolean,
  readEmail,
  readPhone,
  readString,
} from "../utils/validation.js";

const MIN_PASSWORD_LENGTH = 8;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function serializeUser(user) {
  return user.toJSON();
}

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function serializeAddress(address) {
  return {
    id: String(address._id),
    label: address.label || "",
    fullName: address.fullName || "",
    phone: address.phone || "",
    city: address.city || "",
    address: address.address || "",
    postalCode: address.postalCode || "",
    isDefault: Boolean(address.isDefault),
  };
}

function readNameFields(body, { required = false } = {}) {
  const firstName = readString(body?.firstName, "firstName", {
    required: false,
    max: 60,
  });
  const lastName = readString(body?.lastName, "lastName", {
    required: false,
    max: 60,
  });
  const providedName = readString(body?.name, "name", {
    required: false,
    max: 120,
  });
  const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const name = providedName || composedName;

  if (required && !name) {
    throw ApiError.badRequest("invalid_name", {
      field: "name",
      message: "name is required",
    });
  }

  return { firstName, lastName, name };
}

function normalizeAddress(body) {
  return {
    label: readString(body?.label, "label", {
      required: false,
      max: 60,
    }),
    fullName: readString(body?.fullName, "fullName", {
      required: false,
      max: 120,
    }),
    phone: readPhone(body?.phone, false),
    city: readString(body?.city, "city", { max: 120 }),
    address: readString(body?.address, "address", { max: 1000 }),
    postalCode: readString(body?.postalCode, "postalCode", {
      required: false,
      max: 20,
    }),
    isDefault: readBoolean(body?.isDefault, false),
  };
}

function ensureSingleDefaultAddress(user) {
  let defaultIndex = user.addresses.findLastIndex(
    (entry) => entry.isDefault
  );

  if (defaultIndex === -1 && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
    defaultIndex = 0;
  }

  user.addresses.forEach((entry, index) => {
    entry.isDefault = index === defaultIndex;
  });
}

/**
 * Links every order that was placed with the customer's email address to the
 * account, so orders made as a guest can be found after signing up.
 */
async function linkOrdersToUser(user) {
  if (!user.email) {
    return;
  }

  const matchingFilter = {
    $or: [{ user: user._id }, { "customer.email": user.email }],
  };

  await Order.updateMany(
    {
      "customer.email": user.email,
      $or: [{ user: null }, { user: { $exists: false } }],
    },
    { $set: { user: user._id } }
  );

  const orders = await Order.find(matchingFilter).select("_id");

  if (orders.length > 0) {
    user.orders.addToSet(...orders.map((order) => order._id));
    await user.save();
  }
}

function setSessionCookie(response, user) {
  const token = signUserToken(user);
  response.cookie(USER_COOKIE_NAME, token, USER_COOKIE_OPTIONS);
  return token;
}

function clearUserSession(response) {
  response.clearCookie(USER_COOKIE_NAME, { path: "/" });
}

export const register = asyncHandler(async (request, response) => {
  const { firstName, lastName, name } = readNameFields(request.body, {
    required: true,
  });
  const email = readEmail(request.body?.email);
  const phone = readPhone(request.body?.phone, false);
  const password = readString(request.body?.password, "password", {
    min: MIN_PASSWORD_LENGTH,
    max: 200,
  });

  const [existing, adminExists] = await Promise.all([
    User.findOne({ email }).select("+passwordHash"),
    Admin.exists({ email }),
  ]);

  if (existing?.passwordHash || adminExists) {
    throw ApiError.conflict("email_already_registered");
  }

  if (existing) {
    // A guest checkout may already have created a password-less profile with
    // this email. In that case registration upgrades that profile instead of
    // blocking the customer.
    existing.name = name;
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.phone = phone || existing.phone;
    existing.role = "customer";
    existing.isActive = true;
    await existing.setPassword(password);
    await existing.save();
    await linkOrdersToUser(existing);
    await clearAdminSession(request, response);
    clearUserSession(response);

    const upgradedToken = setSessionCookie(response, existing);

    response.status(201).json({
      success: true,
      role: "customer",
      token: upgradedToken,
      user: serializeUser(existing),
    });
    return;
  }

  const user = new User({
    name,
    firstName,
    lastName,
    email,
    phone,
    role: "customer",
  });

  await user.setPassword(password);
  await user.save();
  await linkOrdersToUser(user);
  await clearAdminSession(request, response);
  clearUserSession(response);

  const token = setSessionCookie(response, user);

  response.status(201).json({
    success: true,
    role: "customer",
    token,
    user: serializeUser(user),
  });
});

export const login = asyncHandler(async (request, response) => {
  const email = readEmail(request.body?.email);
  const password = readString(request.body?.password, "password", {
    max: 200,
  });

  const [user, admin] = await Promise.all([
    User.findOne({ email }).select("+passwordHash"),
    Admin.findOne({ email }).select("+passwordHash"),
  ]);

  const [validUser, validAdmin] = await Promise.all([
    user && user.isActive && user.passwordHash
      ? user.verifyPassword(password)
      : Promise.resolve(false),
    admin && admin.isActive && ADMIN_ROLES.includes(admin.role)
      ? admin.verifyPassword(password)
      : Promise.resolve(false),
  ]);

  if (validAdmin) {
    admin.lastLoginAt = new Date();
    await admin.save();
    clearUserSession(response);
    setAdminSessionCookie(response, admin);

    response.json({
      success: true,
      role: admin.role,
      admin: admin.toJSON(),
    });
    return;
  }

  if (validUser) {
    user.lastLoginAt = new Date();
    await user.save();
    await linkOrdersToUser(user);
    await clearAdminSession(request, response);
    clearUserSession(response);

    const token = setSessionCookie(response, user);

    response.json({
      success: true,
      role: "customer",
      token,
      user: serializeUser(user),
    });
    return;
  }

  throw ApiError.unauthorized("invalid_credentials");
});

export const logout = asyncHandler(async (request, response) => {
  await clearAdminSession(request, response);
  clearUserSession(response);

  response.json({
    success: true,
  });
});

export const me = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    user: serializeUser(request.user),
  });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const user = request.user;
  const { firstName, lastName, name } = readNameFields(request.body);
  const phone = readPhone(request.body?.phone, false);
  const email = readEmail(request.body?.email, "email", { required: false });

  if (firstName) {
    user.firstName = firstName;
  }

  if (lastName) {
    user.lastName = lastName;
  }

  if (name) {
    user.name = name;
  } else if (firstName || lastName) {
    const composedName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (composedName) {
      user.name = composedName;
    }
  }

  if (phone) {
    user.phone = phone;
  }

  if (email && email !== user.email) {
    const taken = await User.findOne({ email, _id: { $ne: user._id } });

    if (taken) {
      throw ApiError.conflict("email_already_registered");
    }

    user.email = email;
  }

  // Only touch these fields when the client actually sends them, so a profile
  // update from the account page never clears the saved delivery details.
  if (request.body?.city !== undefined) {
    user.city = readString(request.body.city, "city", {
      required: false,
      max: 120,
    });
  }

  if (request.body?.address !== undefined) {
    user.address = readString(request.body.address, "address", {
      required: false,
      max: 1000,
    });
  }

  if (request.body?.postalCode !== undefined) {
    user.postalCode = readString(request.body.postalCode, "postalCode", {
      required: false,
      max: 20,
    });
  }

  const currentPassword = readString(
    request.body?.currentPassword,
    "currentPassword",
    { required: false, max: 200 }
  );
  const newPassword = readString(request.body?.newPassword, "newPassword", {
    required: false,
    max: 200,
  });

  if (newPassword) {
    if (!currentPassword) {
      throw ApiError.badRequest("current_password_required");
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw ApiError.badRequest("invalid_newPassword");
    }

    const validPassword = await user.verifyPassword(currentPassword);

    if (!validPassword) {
      throw ApiError.unauthorized("invalid_credentials");
    }

    await user.setPassword(newPassword);
  }

  await user.save();
  await linkOrdersToUser(user);

  response.json({
    success: true,
    user: serializeUser(user),
  });
});

export const forgotPassword = asyncHandler(async (request, response) => {
  const email = readEmail(request.body?.email);
  const user = await User.findOne({ email, isActive: true });

  let developmentResetUrl = "";

  if (user) {
    const token = randomBytes(32).toString("hex");
    const resetUrl = `${env.clientOrigins[0].replace(/\/+$/, "")}/account/reset-password?token=${token}`;

    user.resetPasswordTokenHash = hashResetToken(token);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const delivery = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    if (env.nodeEnv !== "production" && !delivery.delivered) {
      developmentResetUrl = resetUrl;
    }
  }

  response.json({
    success: true,
    message: "if_account_exists_email_sent",
    ...(developmentResetUrl ? { devResetUrl: developmentResetUrl } : {}),
  });
});

export const resetPassword = asyncHandler(async (request, response) => {
  const token = readString(request.body?.token, "token", {
    min: 20,
    max: 200,
  });
  const password = readString(request.body?.password, "password", {
    min: MIN_PASSWORD_LENGTH,
    max: 200,
  });

  const user = await User.findOne({
    resetPasswordTokenHash: hashResetToken(token),
    resetPasswordExpires: { $gt: new Date() },
    isActive: true,
  });

  if (!user) {
    throw ApiError.badRequest("invalid_or_expired_reset_token");
  }

  await user.setPassword(password);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  user.lastLoginAt = new Date();
  await user.save();
  await linkOrdersToUser(user);

  const sessionToken = setSessionCookie(response, user);

  response.json({
    success: true,
    token: sessionToken,
    user: serializeUser(user),
  });
});

export const listMyOrders = asyncHandler(async (request, response) => {
  const user = request.user;
  const ownership = [{ user: user._id }];

  if (user.email) {
    ownership.push({ "customer.email": user.email });
  }

  const orders = await Order.find({ $or: ownership })
    .sort({ createdAt: -1 })
    .limit(200);

  response.json({
    success: true,
    orders: orders.map((order) => order.toJSON()),
  });
});

export const getMyOrder = asyncHandler(async (request, response) => {
  const user = request.user;
  const ownership = [{ user: user._id }];

  if (user.email) {
    ownership.push({ "customer.email": user.email });
  }

  const order = await Order.findOne({
    _id: request.params.orderId,
    $or: ownership,
  });

  if (!order) {
    throw ApiError.notFound("order_not_found");
  }

  response.json({
    success: true,
    order: order.toJSON(),
  });
});

export const listAddresses = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    addresses: request.user.addresses.map(serializeAddress),
  });
});

export const createAddress = asyncHandler(async (request, response) => {
  const user = request.user;
  const address = normalizeAddress(request.body);

  if (user.addresses.length === 0) {
    address.isDefault = true;
  }

  user.addresses.push(address);
  ensureSingleDefaultAddress(user);
  await user.save();

  response.status(201).json({
    success: true,
    addresses: user.addresses.map(serializeAddress),
  });
});

export const updateAddress = asyncHandler(async (request, response) => {
  const user = request.user;
  const address = user.addresses.id(request.params.addressId);

  if (!address) {
    throw ApiError.notFound("address_not_found");
  }

  const payload = normalizeAddress(request.body);

  address.label = payload.label;
  address.fullName = payload.fullName;
  address.phone = payload.phone;
  address.city = payload.city;
  address.address = payload.address;
  address.postalCode = payload.postalCode;

  if (payload.isDefault) {
    user.addresses.forEach((entry) => {
      entry.isDefault = false;
    });
  }

  address.isDefault = payload.isDefault || address.isDefault;

  ensureSingleDefaultAddress(user);
  await user.save();

  response.json({
    success: true,
    addresses: user.addresses.map(serializeAddress),
  });
});

export const deleteAddress = asyncHandler(async (request, response) => {
  const user = request.user;
  const address = user.addresses.id(request.params.addressId);

  if (!address) {
    throw ApiError.notFound("address_not_found");
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (wasDefault) {
    ensureSingleDefaultAddress(user);
  }

  await user.save();

  response.json({
    success: true,
    addresses: user.addresses.map(serializeAddress),
  });
});

export default {
  register,
  login,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
  listMyOrders,
  getMyOrder,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
