import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const COOKIE_NAME = "fakhara_rating_customer";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;
const CUSTOMER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loadSigningSecret(dataDir) {
  if (process.env.FAKHARA_RATING_SECRET) {
    if (process.env.FAKHARA_RATING_SECRET.length < 32) {
      throw new Error(
        "FAKHARA_RATING_SECRET must contain at least 32 characters."
      );
    }

    return process.env.FAKHARA_RATING_SECRET;
  }

  const secretPath = path.join(dataDir, ".rating-secret");

  if (existsSync(secretPath)) {
    return readFileSync(secretPath, "utf8").trim();
  }

  const secret = randomBytes(32).toString("hex");
  writeFileSync(secretPath, secret, { mode: 0o600 });
  return secret;
}

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const separator = part.indexOf("=");

    if (separator === -1) {
      return cookies;
    }

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }

    return cookies;
  }, {});
}

function isSecureRequest(request) {
  if (request.socket?.encrypted) {
    return true;
  }

  const forwardedProtocol = request.headers["x-forwarded-proto"];

  return (
    typeof forwardedProtocol === "string" &&
    forwardedProtocol.split(",")[0].trim() === "https"
  );
}

export function createCustomerSession({ dataDir }) {
  const secret = loadSigningSecret(dataDir);

  function sign(customerId) {
    return createHmac("sha256", secret)
      .update(customerId)
      .digest("base64url");
  }

  function readCustomerId(request) {
    const token = parseCookies(request.headers.cookie)[COOKIE_NAME];

    if (!token) {
      return null;
    }

    const separator = token.lastIndexOf(".");

    if (separator === -1) {
      return null;
    }

    const customerId = token.slice(0, separator);
    const providedSignature = token.slice(separator + 1);

    if (!CUSTOMER_ID_PATTERN.test(customerId)) {
      return null;
    }

    const expectedSignature = sign(customerId);
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return null;
    }

    return customerId;
  }

  function ensureCustomer(request, response) {
    const existingCustomerId = readCustomerId(request);

    if (existingCustomerId) {
      return existingCustomerId;
    }

    const customerId = randomUUID();
    const token = `${customerId}.${sign(customerId)}`;
    const attributes = [
      `${COOKIE_NAME}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${COOKIE_MAX_AGE}`,
    ];

    if (isSecureRequest(request)) {
      attributes.push("Secure");
    }

    response.setHeader("Set-Cookie", attributes.join("; "));
    return customerId;
  }

  return {
    ensureCustomer,
    readCustomerId,
  };
}
