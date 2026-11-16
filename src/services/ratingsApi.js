import { buildApiUrl } from "./apiConfig.js";

export class RatingsApiError extends Error {
  constructor(code, status = 0) {
    super(code);
    this.name = "RatingsApiError";
    this.code = code;
    this.status = status;
  }
}

async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      // "include" keeps the anonymous customer cookie working when the API
      // is served from another origin (VITE_API_URL).
      credentials: "include",
      ...options,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new RatingsApiError("network_error");
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new RatingsApiError(
      payload?.error || "request_failed",
      response.status
    );
  }

  return payload;
}

function ratingUrl(productId) {
  return buildApiUrl(`/api/ratings/${encodeURIComponent(productId)}`);
}

export function fetchProductRating(productId, { signal } = {}) {
  return request(ratingUrl(productId), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
}

export function saveProductRating(
  productId,
  { rating, review },
  { signal } = {}
) {
  return request(ratingUrl(productId), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, review }),
    signal,
  });
}
