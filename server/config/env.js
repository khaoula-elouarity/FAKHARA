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

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveClientOrigins() {
  const origins = [
    ...new Set([
      ...parseOrigins(process.env.CLIENT_URL),
      ...parseOrigins(process.env.CLIENT_ORIGIN),
    ]),
  ];

  return origins.length ? origins : ["http://localhost:5173"];
}

mkdirSync(dataDir, { recursive: true });

function loadJwtSecret() {
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must contain at least 32 characters.");
    }

    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
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

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || "0.0.0.0",
  projectDir,
  dataDir,
  mongoUri: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGO_DB_NAME || "fakhara",
  mongoMemoryDbPath:
    process.env.MONGO_MEMORY_DB_PATH || path.join(dataDir, "mongodb"),
  jwtSecret: loadJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigins: resolveClientOrigins(),
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
