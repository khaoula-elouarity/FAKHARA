import { createCustomerSession } from "./customerSession.js";
import {
  createRatingStore,
  isKnownProduct,
  resolveDataDir,
} from "./ratingStore.js";

const MAX_BODY_BYTES = 32 * 1024;
const MAX_REVIEW_LENGTH = 1000;

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

function sendJson(response, status, payload, additionalHeaders = {}) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  for (const [name, value] of Object.entries(additionalHeaders)) {
    response.setHeader(name, value);
  }

  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const contentType = String(request.headers["content-type"] || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw new HttpError(415, "unsupported_media_type");
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;

    if (totalBytes > MAX_BODY_BYTES) {
      throw new HttpError(413, "payload_too_large");
    }

    chunks.push(chunk);
  }

  if (totalBytes === 0) {
    throw new HttpError(400, "invalid_json");
  }

  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    if (!body || Array.isArray(body) || typeof body !== "object") {
      throw new Error("Invalid body");
    }

    return body;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

function parseRating(body) {
  if (
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    throw new HttpError(400, "invalid_rating");
  }

  return body.rating;
}

function parseReview(body) {
  if (body.review === undefined || body.review === null) {
    return null;
  }

  if (typeof body.review !== "string") {
    throw new HttpError(400, "invalid_review");
  }

  const review = body.review.trim();

  if (!review) {
    return null;
  }

  if (review.length > MAX_REVIEW_LENGTH) {
    throw new HttpError(400, "invalid_review");
  }

  return review;
}

async function handleRatingsRequest(
  request,
  response,
  { ratingStore, customerSession }
) {
  const url = new URL(request.url || "/", "http://localhost");
  const routeMatch = url.pathname.match(
    /^\/api\/ratings\/([^/]+)\/?$/
  );

  if (!routeMatch) {
    throw new HttpError(404, "not_found");
  }

  let productId;

  try {
    productId = decodeURIComponent(routeMatch[1]);
  } catch {
    throw new HttpError(400, "invalid_product");
  }

  if (!isKnownProduct(productId)) {
    throw new HttpError(404, "product_not_found");
  }

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Allow", "GET, POST, OPTIONS");
    response.end();
    return;
  }

  if (request.method === "GET") {
    const customerId = customerSession.readCustomerId(request);

    sendJson(
      response,
      200,
      ratingStore.getSummary(productId, customerId)
    );
    return;
  }

  if (request.method === "POST") {
    const customerId = customerSession.ensureCustomer(request, response);
    const body = await readJsonBody(request);
    const rating = parseRating(body);
    const review = parseReview(body);
    const result = ratingStore.saveRating({
      productId,
      customerId,
      rating,
      review,
    });

    sendJson(response, result.created ? 201 : 200, result.summary);
    return;
  }

  response.setHeader("Allow", "GET, POST, OPTIONS");
  throw new HttpError(405, "method_not_allowed");
}

export function createRatingsMiddleware({ dataDir } = {}) {
  const resolvedDataDir = resolveDataDir(dataDir);
  const ratingStore = createRatingStore({ dataDir: resolvedDataDir });
  const customerSession = createCustomerSession({
    dataDir: resolvedDataDir,
  });

  async function ratingsMiddleware(request, response, next) {
    const pathname = new URL(
      request.url || "/",
      "http://localhost"
    ).pathname;

    if (
      pathname !== "/api/ratings" &&
      !pathname.startsWith("/api/ratings/")
    ) {
      next();
      return;
    }

    try {
      await handleRatingsRequest(request, response, {
        ratingStore,
        customerSession,
      });
    } catch (error) {
      if (response.headersSent) {
        response.end();
        return;
      }

      if (error instanceof HttpError) {
        sendJson(response, error.status, { error: error.code });
        return;
      }

      console.error("Ratings API error:", error);
      sendJson(response, 500, { error: "internal_error" });
    }
  }

  ratingsMiddleware.close = () => ratingStore.close();

  return ratingsMiddleware;
}
