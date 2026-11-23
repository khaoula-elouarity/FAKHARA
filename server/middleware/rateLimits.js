import { rateLimit } from "express-rate-limit";

function jsonLimitMessage(message) {
  return {
    success: false,
    error: "rate_limit_exceeded",
    message,
  };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonLimitMessage(
    "Too many requests. Please wait a few minutes and try again."
  ),
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonLimitMessage(
    "Too many submissions. Please wait a few minutes and try again."
  ),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonLimitMessage(
    "Too many login attempts. Please wait a few minutes and try again."
  ),
});

export const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: jsonLimitMessage(
    "Too many tracking attempts. Please wait a few minutes and try again."
  ),
});

export default {
  apiLimiter,
  writeLimiter,
  loginLimiter,
  trackingLimiter,
};
