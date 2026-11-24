import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(serverDir, "..", "..");

// server/.env holds the backend configuration and takes precedence.
// The project-root .env is kept as a fallback so existing setups keep working.
// Real environment variables always win over both files.
dotenv.config({
  path: [
    path.resolve(serverDir, "..", ".env"),
    path.resolve(projectDir, ".env"),
  ],
  quiet: true,
});

const dataDir = path.resolve(
  process.env.FAKHARA_DATA_DIR || path.join(projectDir, "server", "data")
);
const nodeEnv = process.env.NODE_ENV || "development";

const productionClientOrigin = "https://my-fakhara.vercel.app";

function normalizeOrigin(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
}

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .map(normalizeOrigin)
    .filter(Boolean);
}

function resolveClientOrigins() {
  const configuredOrigins = parseOrigins(process.env.CLIENT_URL);
  const configuredAlternateOrigins = parseOrigins(process.env.CLIENT_ORIGIN);

  if (nodeEnv === "production") {
    return [
      ...new Set([
        productionClientOrigin,
        ...configuredOrigins,
        ...configuredAlternateOrigins,
      ]),
    ];
  }

  const origins = [
    ...new Set([...configuredOrigins, ...configuredAlternateOrigins]),
  ];

  if (origins.length) {
    return origins;
  }

  return ["http://localhost:5173"];
}

// Vercel's deployed source filesystem is read-only. File-backed development
// helpers may create their directory only outside production.
if (nodeEnv !== "production") {
  mkdirSync(dataDir, { recursive: true });
}

function loadJwtSecret() {
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must contain at least 32 characters.");
    }

    return process.env.JWT_SECRET;
  }

  if (nodeEnv === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  const secretPath = path.join(dataDir, ".jwt-secret");

  if (existsSync(secretPath)) {
    return readFileSync(secretPath, "utf8").trim();
  }

  const secret = randomBytes(48).toString("hex");
  writeFileSync(secretPath, secret, { mode: 0o600 });
  console.warn(
    "JWT_SECRET is not set. A development-only secret was generated in server/data/.jwt-secret."
  );
  return secret;
}

const mongoUri = process.env.MONGODB_URI || "";
if (nodeEnv === "production" && !mongoUri) {
  throw new Error("MONGODB_URI is required in production.");
}

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

export function requireCloudinaryConfig() {
  if (Object.values(cloudinary).some((value) => !value)) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required for image uploads."
    );
  }
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || "0.0.0.0",
  projectDir,
  dataDir,
  mongoUri,
  mongoDbName: process.env.MONGO_DB_NAME || "fakhara",
  mongoMemoryDbPath:
    process.env.MONGO_MEMORY_DB_PATH || path.join(dataDir, "mongodb"),
  jwtSecret: loadJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigins: resolveClientOrigins(),
  cloudinary,
  mailFrom: process.env.MAIL_FROM || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  adminName: process.env.ADMIN_NAME || "FAKHARA Admin",
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
  adminPassword: process.env.ADMIN_PASSWORD || "",
  deliveryDefaults: {
    Casablanca: 25,
    Rabat: 30,
    Mohammedia: 25,
    Nouaceur: 25,
    Bouskoura: 25,
    Marrakech: 40,
    Fes: 40,
    Tangier: 45,
    Agadir: 45,
    Other: 50,
  },
};

export default env;
