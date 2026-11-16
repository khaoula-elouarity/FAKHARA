import { mkdirSync } from "node:fs";

import mongoose from "mongoose";

import env from "./env.js";

let memoryServer = null;
let loggingAttached = false;

const CONNECT_ATTEMPTS =
  Math.max(1, Number(process.env.MONGO_CONNECT_ATTEMPTS) || 3);
const RETRY_DELAY_MS = 4000;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Describes the connection target without ever printing credentials. This is
 * safe to write to the logs even when the URI contains a username/password.
 */
function describeMongoTarget(uri) {
  try {
    const parsed = new URL(uri);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return "the configured MongoDB server";
  }
}

function attachConnectionLogging() {
  if (loggingAttached) {
    return;
  }

  loggingAttached = true;

  mongoose.connection.on("connected", () => {
    console.log(
      `MongoDB connected (database: ${mongoose.connection.name}, host: ${mongoose.connection.host}).`
    );
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });
}

async function connectWithRetry(uri) {
  let lastError = null;

  for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        dbName: env.mongoDbName,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });

      return mongoose.connection;
    } catch (error) {
      lastError = error;
      console.error(
        `MongoDB connection attempt ${attempt}/${CONNECT_ATTEMPTS} failed for ${describeMongoTarget(uri)}: ${error.message}`
      );
      await mongoose.disconnect().catch(() => {});

      if (attempt < CONNECT_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(
    `Unable to connect to MongoDB at ${describeMongoTarget(uri)} after ${CONNECT_ATTEMPTS} attempts: ${lastError?.message || "unknown error"}`
  );
}

export async function connectDatabase() {
  attachConnectionLogging();

  if (env.mongoUri) {
    // A configured database is authoritative: never silently fall back to a
    // local/in-memory database, otherwise an admin could edit the wrong data.
    return connectWithRetry(env.mongoUri);
  }

  if (env.nodeEnv === "production") {
    throw new Error(
      "MONGODB_URI is required in production. Set it in your .env file."
    );
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  mkdirSync(env.mongoMemoryDbPath, { recursive: true });

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbPath: env.mongoMemoryDbPath,
      args: [
        "--wiredTigerCacheSizeGB",
        "0.25",
        "--setParameter",
        "diagnosticDataCollectionEnabled=false",
      ],
    },
  });

  const uri = memoryServer.getUri();

  await mongoose.connect(uri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `Development MongoDB started at ${uri} (persistent data: ${env.mongoMemoryDbPath}).`
  );

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
