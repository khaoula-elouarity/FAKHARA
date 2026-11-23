import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const ADMIN_COOKIE_NAME = "fakhara_admin_token";

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  // The browser reaches the API on a separate Vercel origin in production.
  // Cross-site fetch cookies require SameSite=None and Secure.
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function readTokens(request) {
  const tokens = [];
  const authorization = request.headers.authorization || "";
  const cookieToken = request.cookies?.[ADMIN_COOKIE_NAME] || "";

  if (authorization.startsWith("Bearer ")) {
    tokens.push(authorization.slice(7).trim());
  }

  if (cookieToken) {
    tokens.push(cookieToken);
  }

  return [...new Set(tokens.filter(Boolean))];
}

export function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: String(admin._id),
      role: admin.role,
      type: "admin",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export const protectAdmin = asyncHandler(async (request, _response, next) => {
  const tokens = readTokens(request);

  if (tokens.length === 0) {
    throw ApiError.unauthorized("admin_authentication_required");
  }

  // Accept either the httpOnly cookie (browser) or a Bearer token (API
  // clients). Trying both means a stale Authorization header left in old
  // browsers can no longer shadow a perfectly valid session cookie.
  let payload = null;

  for (const token of tokens) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret);

      // A customer token must never be accepted on an administrator route,
      // even if a customer and an administrator shared an ObjectId.
      if (decoded?.type === "admin") {
        payload = decoded;
        break;
      }
    } catch {
      // Try the next credential.
    }
  }

  if (!payload) {
    throw ApiError.unauthorized("invalid_or_expired_token");
  }

  const admin = await Admin.findById(payload.sub);

  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized("admin_account_unavailable");
  }

  request.admin = admin;
  next();
});

export function authorize(...roles) {
  return function authorizationMiddleware(request, _response, next) {
    if (!request.admin) {
      next(ApiError.unauthorized("admin_authentication_required"));
      return;
    }

    if (roles.length > 0 && !roles.includes(request.admin.role)) {
      next(ApiError.forbidden("insufficient_permissions"));
      return;
    }

    next();
  };
}

/**
 * Enforces a granular administrator capability. The superadmin role implicitly
 * holds every permission. Administrators created before the permissions field
 * existed fall back to the full default capability set.
 */
/**
 * Accepts the request when the administrator holds at least one of the given
 * permissions. Used by shared resources such as the image upload endpoint.
 */
export function requireAnyPermission(...permissions) {
  const allowed = permissions.flat();

  return function anyPermissionMiddleware(request, _response, next) {
    const admin = request.admin;

    if (!admin) {
      next(ApiError.unauthorized("admin_authentication_required"));
      return;
    }

    if (admin.role === "superadmin") {
      next();
      return;
    }

    const owned = Array.isArray(admin.permissions) ? admin.permissions : [];

    if (allowed.some((permission) => owned.includes(permission))) {
      next();
      return;
    }

    next(ApiError.forbidden("insufficient_permissions"));
  };
}

export function requirePermission(permission) {
  return function permissionMiddleware(request, _response, next) {
    const admin = request.admin;

    if (!admin) {
      next(ApiError.unauthorized("admin_authentication_required"));
      return;
    }

    if (admin.role === "superadmin") {
      next();
      return;
    }

    const permissions = Array.isArray(admin.permissions)
      ? admin.permissions
      : [];

    if (permissions.includes(permission)) {
      next();
      return;
    }

    next(ApiError.forbidden("insufficient_permissions"));
  };
}

export default protectAdmin;
