/**
 * Centralized API configuration for the FAKHARA frontend.
 *
 * The base URL comes from the Vite environment variable VITE_API_URL
 * (see .env / .env.example). Only VITE_* variables are exposed to the
 * browser bundle, so no private secret may ever be stored here.
 */

const configuredBaseUrl = (import.meta.env.VITE_API_URL || "").trim();

/**
 * Normalized base URL without a trailing slash.
 * Empty string means "same origin": requests go to /api/... and are
 * forwarded to the backend by the Vite dev proxy (vite.config.js).
 */
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

/** True when the frontend talks to the backend on a different origin. */
export const IS_ABSOLUTE_API_URL = API_BASE_URL !== "";

/**
 * Builds a full request URL for an API path.
 * @param {string} path API path, e.g. "/api/products"
 * @returns {string} absolute URL when VITE_API_URL is set, otherwise the path
 */
export function buildApiUrl(path) {
  const suffix = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE_URL) {
    return suffix;
  }

  // Avoid producing ".../api/api/products" when the base already ends with /api.
  const base = API_BASE_URL;
  const baseEndsWithApi = base.endsWith("/api");

  if (baseEndsWithApi && (suffix === "/api" || suffix.startsWith("/api/"))) {
    return `${base}${suffix.slice("/api".length)}`;
  }

  return `${base}${suffix}`;
}

export default {
  API_BASE_URL,
  IS_ABSOLUTE_API_URL,
  buildApiUrl,
};
