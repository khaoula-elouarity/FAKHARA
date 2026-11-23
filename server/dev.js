import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(serverDir, "..");
dotenv.config({
  path: [path.join(serverDir, ".env"), path.join(projectDir, ".env")],
  quiet: true,
});

let memoryServer = null;
if (!process.env.MONGODB_URI && process.env.NODE_ENV !== "production") {
  const dataDir = path.resolve(
    process.env.FAKHARA_DATA_DIR || path.join(projectDir, "server", "data")
  );
  const mongoMemoryDbPath =
    process.env.MONGO_MEMORY_DB_PATH || path.join(dataDir, "mongodb");
  mkdirSync(mongoMemoryDbPath, { recursive: true });
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbPath: mongoMemoryDbPath,
      args: [
        "--wiredTigerCacheSizeGB",
        "0.25",
        "--setParameter",
        "diagnosticDataCollectionEnabled=false",
      ],
    },
  });
  process.env.MONGODB_URI = memoryServer.getUri();
}

const [{ default: env }, { connectDatabase, disconnectDatabase }, { createApp }, { seedDatabase }, migrateModule] = await Promise.all([
  import("./config/env.js"),
  import("./config/db.js"),
  import("./app.js"),
  import("./utils/seed.js"),
  import("./utils/migrateLegacyData.js"),
]);
const migrateLegacyData = migrateModule.default;

const app = createApp();
let shuttingDown = false;
let setupStarted = false;

const server = app.listen(env.port, env.host, () => {
  console.log(
    `FAKHARA API listening on http://localhost:${env.port} (${env.nodeEnv}).`
  );
});

async function prepareDatabase() {
  if (setupStarted) {
    return;
  }

  setupStarted = true;

  try {
    await connectDatabase();
    await seedDatabase();
    await migrateLegacyData();
  } catch (error) {
    setupStarted = false;
    console.error(
      `Database setup deferred; API will retry on the next request (${error?.message || error?.code || error?.name || "unknown"}).`
    );
  }
}

mongoose.connection.once("connected", () => {
  prepareDatabase();
});

prepareDatabase();

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);
  await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
  await memoryServer?.stop();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
