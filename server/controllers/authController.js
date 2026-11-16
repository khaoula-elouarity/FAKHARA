import Admin, {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
} from "../models/Admin.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { readEmail, readString } from "../utils/validation.js";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
  signAdminToken,
} from "../middleware/auth.js";

function setAdminSessionCookie(response, token) {
  response.cookie(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
  return token;
}

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
  const password = readString(request.body?.password, "password", {
    min: 1,
    max: 200,
    trim: false,
  });

  const admin = await Admin.findOne({ email }).select("+passwordHash");

  if (!admin) {
    logFailedLogin(request, email, "unknown_email");
    throw ApiError.unauthorized("invalid_credentials");
  }

  if (!admin.isActive) {
    logFailedLogin(request, email, "inactive_admin");
    throw ApiError.unauthorized("invalid_credentials");
  }

  const validPassword = await admin.verifyPassword(password);

  if (!validPassword) {
    logFailedLogin(request, email, "invalid_password");
    throw ApiError.unauthorized("invalid_credentials");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = setAdminSessionCookie(response, signAdminToken(admin));

  console.log(`Admin login: ${admin.email} (${admin.role}).`);

  response.json({
    success: true,
    token,
    admin: admin.toJSON(),
  });
});

export const logout = asyncHandler(async (_request, response) => {
  response.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });

  response.json({
    success: true,
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
