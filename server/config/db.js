import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";
import env from "./env.js";

let loggingAttached = false;
let connectionPromise = null;
let connectionEstablished = false;

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
    if (connectionEstablished) {
      connectionEstablished = false;
      connectionPromise = null;
    }
  });

  mongoose.connection.on("error", (error) => {
    console.error(
      `MongoDB connection error (${error?.code || error?.name || "unknown"}).`
    );
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
        `MongoDB connection attempt ${attempt}/${CONNECT_ATTEMPTS} failed for ${describeMongoTarget(uri)} (${error?.code || error?.name || "unknown"}).`
      );
      await mongoose.disconnect().catch(() => {});

      if (attempt < CONNECT_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(
    `Unable to connect to MongoDB at ${describeMongoTarget(uri)} after ${CONNECT_ATTEMPTS} attempts (${lastError?.code || lastError?.name || "unknown error"}).`
  );
}

export async function connectDatabase() {
  attachConnectionLogging();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Share one in-flight connection attempt across concurrent requests in a
  // warm Vercel instance. Mongoose's connection is process-wide and is reused
  // for later invocations.
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    if (!env.mongoUri) {
      throw ApiError.serviceUnavailable("database_unavailable");
    }

    try {
      const connection = await connectWithRetry(env.mongoUri);
      connectionEstablished = true;
      return connection;
    } catch {
      throw ApiError.serviceUnavailable("database_unavailable");
    }
  })().catch((error) => {
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = null;
  connectionEstablished = false;
  await mongoose.disconnect();
}
