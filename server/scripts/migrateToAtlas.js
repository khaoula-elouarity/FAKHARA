import { MongoClient } from "mongodb";

import env from "../config/env.js";

/**
 * Copies the local FAKHARA database to the configured MongoDB Atlas cluster.
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate -- --replace
 *
 * By default a collection already present in the destination is skipped so a
 * later run can never overwrite data that was created directly on Atlas.
 * `--replace` performs an upsert for every source document (keyed by _id).
 */
const SOURCE_URI =
  process.env.SOURCE_MONGODB_URI || "mongodb://127.0.0.1:27017";
const TARGET_URI = env.mongoUri;
const SOURCE_DB = process.env.SOURCE_MONGO_DB_NAME || env.mongoDbName;
const TARGET_DB = env.mongoDbName;
const REPLACE = process.argv.includes("--replace");
const BATCH_SIZE = 500;

function normalize(uri) {
  return uri.replace(/\/+$/, "");
}

function redact(uri) {
  try {
    const parsed = new URL(uri);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return "unknown";
  }
}

async function copyCollection(sourceDb, targetDb, name) {
  const sourceCount = await sourceDb.collection(name).countDocuments();
  const targetCount = await targetDb.collection(name).countDocuments();

  if (targetCount > 0 && !REPLACE) {
    console.log(
      `- ${name}: skipped (${targetCount} document(s) already on Atlas, ${sourceCount} in source)`
    );
    return { name, copied: 0, skipped: true };
  }

  const cursor = sourceDb.collection(name).find({});
  let batch = [];
  let copied = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    await targetDb.collection(name).bulkWrite(
      batch.map((document) => ({
        replaceOne: {
          filter: { _id: document._id },
          replacement: document,
          upsert: true,
        },
      })),
      { ordered: false }
    );
    copied += batch.length;
    batch = [];
  };

  for await (const document of cursor) {
    batch.push(document);
    if (batch.length >= BATCH_SIZE) {
      await flush();
    }
  }
  await flush();

  // Recreate the source indexes (Mongoose also creates them on startup, but
  // this makes the copy immediately consistent and keeps unique constraints).
  const indexes = await sourceDb.collection(name).indexes();
  for (const index of indexes) {
    if (index.name === "_id_") continue;
    const { key, name: indexName, ...options } = index;
    try {
      await targetDb.collection(name).createIndex(key, {
        ...options,
        name: indexName,
      });
    } catch (error) {
      if (error.code !== 85 && error.code !== 86) {
        // 85 = IndexOptionsConflict, 86 = IndexKeySpecsConflict
        console.warn(`  ! index ${indexName} on ${name}: ${error.message}`);
      }
    }
  }

  console.log(`- ${name}: copied ${copied} document(s)`);
  return { name, copied, skipped: false };
}

async function main() {
  if (!TARGET_URI) {
    throw new Error(
      "MONGODB_URI is empty. Configure your Atlas connection string in server/.env."
    );
  }

  if (normalize(SOURCE_URI) === normalize(TARGET_URI)) {
    throw new Error(
      "Source and destination point to the same MongoDB URI; nothing to migrate."
    );
  }

  console.log(`Source:      ${redact(SOURCE_URI)} / ${SOURCE_DB}`);
  console.log(`Destination: ${redact(TARGET_URI)} / ${TARGET_DB}`);
  console.log(`Mode:        ${REPLACE ? "replace (upsert)" : "create only"}`);

  const sourceClient = new MongoClient(SOURCE_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  const targetClient = new MongoClient(TARGET_URI, {
    serverSelectionTimeoutMS: 20000,
  });

  await sourceClient.connect();
  await targetClient.connect();

  try {
    const sourceDb = sourceClient.db(SOURCE_DB);
    const targetDb = targetClient.db(TARGET_DB);
    const collections = await sourceDb.listCollections().toArray();
    const names = collections
      .map((collection) => collection.name)
      .filter((name) => !name.startsWith("system."))
      .sort();

    if (names.length === 0) {
      console.log("No collection found in the source database.");
      return;
    }

    let copied = 0;
    let skipped = 0;

    for (const name of names) {
      const result = await copyCollection(sourceDb, targetDb, name);
      copied += result.copied;
      skipped += result.skipped ? 1 : 0;
    }

    console.log(
      `Migration complete: ${copied} document(s) copied, ${skipped} collection(s) skipped.`
    );
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
