import { createContactStore } from "./contactStore.js";
import { resolveDataDir } from "./ratingStore.js";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function parseText(body, key, maxLength) {
  const value =
    typeof body[key] === "string" ? body[key].trim() : "";

  if (!value || value.length > maxLength) {
    throw new HttpError(400, `invalid_${key}`);
  }

  return value;
}

function parseContactMessage(body) {
  const name = parseText(body, "name", MAX_NAME_LENGTH);
  const email = parseText(body, "email", MAX_EMAIL_LENGTH);
  const subject = parseText(body, "subject", MAX_SUBJECT_LENGTH);
  const message = parseText(body, "message", MAX_MESSAGE_LENGTH);

  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "invalid_email");
  }

  return { name, email, subject, message };
}

async function handleContactRequest(request, response, { contactStore }) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Allow", "POST, OPTIONS");
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    throw new HttpError(405, "method_not_allowed");
  }

  const body = await readJsonBody(request);
  const contactMessage = parseContactMessage(body);
  const savedMessage = contactStore.saveMessage(contactMessage);

  sendJson(response, 201, {
    success: true,
    messageId: savedMessage.id,
    createdAt: savedMessage.createdAt,
  });
}

export function createContactMiddleware({ dataDir } = {}) {
  const resolvedDataDir = resolveDataDir(dataDir);
  const contactStore = createContactStore({ dataDir: resolvedDataDir });

  async function contactMiddleware(request, response, next) {
    const pathname = new URL(
      request.url || "/",
      "http://localhost"
    ).pathname;

    if (pathname !== "/api/contact" && pathname !== "/api/contact/") {
      next();
      return;
    }

    try {
      await handleContactRequest(request, response, { contactStore });
    } catch (error) {
      if (response.headersSent) {
        response.end();
        return;
      }

      if (error instanceof HttpError) {
        sendJson(response, error.status, { error: error.code });
        return;
      }

      console.error("Contact API error:", error);
      sendJson(response, 500, { error: "internal_error" });
    }
  }

  contactMiddleware.close = () => contactStore.close();

  return contactMiddleware;
}
