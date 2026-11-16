import jwt from "jsonwebtoken";

import User from "../models/User.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const USER_COOKIE_NAME = "fakhara_user_token";

function readToken(request) {
  const authorization = request.headers.authorization || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return request.cookies?.[USER_COOKIE_NAME] || "";
}

export function signUserToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      type: "customer",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

/**
 * Attaches request.user when a valid customer token is present, without
 * rejecting anonymous visitors. Used by routes that accept both guests and
 * registered customers.
 */
export const attachUser = asyncHandler(async (request, _response, next) => {
  const token = readToken(request);

  if (!token) {
    next();
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    next();
    return;
  }

  if (payload?.type !== "customer") {
    next();
    return;
  }

  const user = await User.findById(payload.sub);

  if (user && user.isActive) {
    request.user = user;
  }

  next();
});

/**
 * Requires a valid customer token.
 */
export const protectUser = asyncHandler(async (request, _response, next) => {
  const token = readToken(request);

  if (!token) {
    throw ApiError.unauthorized("authentication_required");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized("invalid_or_expired_token");
  }

  if (payload?.type !== "customer") {
    throw ApiError.unauthorized("invalid_token");
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("account_unavailable");
  }

  request.user = user;
  next();
});

export const USER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export { USER_COOKIE_NAME };
export default protectUser;
