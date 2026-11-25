import Admin, {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
} from "../models/Admin.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { readEmail, readString } from "../utils/validation.js";
import {
  clearAdminSession,
  safeEqual,
  setAdminSessionCookie,
} from "../middleware/auth.js";

/**
 * Records the reason a login was rejected in the server console. The password
 * is never logged, only the submitted e-mail (normalised) and the reason, which
 * is enough to distinguish a typo from a missing/inactive account.
 */
function logFailedLogin(request, email, reason) {
  console.warn(
    `Admin login rejected (${reason}) for ${email || "(invalid email)"} from ${request.ip || "unknown IP"}.`
  );
}

export const login = asyncHandler(async (request, response) => {
  const email = readEmail(request.body?.email);
  const password = request.body?.password
    ? readString(request.body.password, "password", {
        min: 1,
        max: 200,
        trim: false,
      })
    : "";
  const verificationCode = request.body?.verificationCode
    ? readString(request.body.verificationCode, "verificationCode", {
        min: 1,
        max: 200,
        trim: false,
      })
    : "";

  if (!password && !verificationCode) {
    throw ApiError.badRequest("credentials_required");
  }

  const admin = await Admin.findOne({ email }).select("+passwordHash");

  if (!admin) {
    logFailedLogin(request, email, "unknown_email");
    throw ApiError.unauthorized("invalid_credentials");
  }

  if (!admin.isActive || !ADMIN_ROLES.includes(admin.role)) {
    logFailedLogin(request, email, "inactive_or_invalid_role");
    throw ApiError.unauthorized("invalid_credentials");
  }

  let validCredentials = false;

  if (password) {
    validCredentials = await admin.verifyPassword(password);
  }

  if (!validCredentials && verificationCode) {
    if (!env.adminVerificationCode || email !== env.adminEmail) {
      logFailedLogin(request, email, "verification_code_unavailable");
    } else if (safeEqual(verificationCode, env.adminVerificationCode)) {
      validCredentials = true;
    } else {
      logFailedLogin(request, email, "invalid_verification_code");
    }
  }

  if (!validCredentials) {
    logFailedLogin(request, email, "invalid_credentials");
    throw ApiError.unauthorized("invalid_credentials");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  setAdminSessionCookie(response, admin);

  console.log(`Admin login: ${admin.email} (${admin.role}).`);

  response.json({
    success: true,
    admin: admin.toJSON(),
  });
});

export const logout = asyncHandler(async (request, response) => {
  await clearAdminSession(request, response);

  response.json({
    success: true,
  });
});

export const bootstrapStatus = asyncHandler(async (_request, response) => {
  const adminCount = await Admin.countDocuments();

  response.json({
    success: true,
    available: adminCount === 0 && Boolean(env.adminBootstrapSecret),
  });
});

export const bootstrapAdmin = asyncHandler(async (request, response) => {
  if (!env.adminBootstrapSecret) {
    throw ApiError.notFound("bootstrap_unavailable");
  }

  if ((await Admin.countDocuments()) > 0) {
    throw ApiError.conflict("admin_already_exists");
  }

  const secret = readString(request.body?.secret, "secret", {
    min: 1,
    max: 200,
    trim: false,
  });

  if (!safeEqual(secret, env.adminBootstrapSecret)) {
    console.warn(
      `Admin bootstrap rejected from ${request.ip || "unknown IP"}.`
    );
    throw ApiError.unauthorized("invalid_bootstrap_secret");
  }

  const name = request.body?.name
    ? readString(request.body.name, "name", { max: 120 })
    : env.adminName;
  const email = readEmail(request.body?.email);
  const password = readString(request.body?.password, "password", {
    min: 12,
    max: 200,
    trim: false,
  });

  const admin = new Admin({
    name,
    email,
    role: "superadmin",
    permissions: [...ADMIN_PERMISSIONS],
  });
  await admin.setPassword(password);
  await admin.save();

  setAdminSessionCookie(response, admin);

  console.log(`First administrator created: ${admin.email}.`);

  response.status(201).json({
    success: true,
    admin: admin.toJSON(),
  });
});

export const me = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    admin: request.admin.toJSON(),
  });
});

export const createAdmin = asyncHandler(async (request, response) => {
  const name = readString(request.body?.name, "name", { max: 120 });
  const email = readEmail(request.body?.email);
  const password = readString(request.body?.password, "password", {
    min: 12,
    max: 200,
    trim: false,
  });
  const role = ADMIN_ROLES.includes(request.body?.role)
    ? request.body.role
    : "admin";

  let permissions;

  if (Array.isArray(request.body?.permissions)) {
    permissions = [
      ...new Set(
        request.body.permissions.filter((permission) =>
          ADMIN_PERMISSIONS.includes(permission)
        )
      ),
    ];
  }

  const existing = await Admin.findOne({ email });

  if (existing) {
    throw ApiError.conflict("admin_email_already_exists");
  }

  const admin = new Admin({
    name,
    email,
    role,
    ...(permissions ? { permissions } : {}),
  });
  await admin.setPassword(password);
  await admin.save();

  response.status(201).json({
    success: true,
    admin: admin.toJSON(),
  });
});
