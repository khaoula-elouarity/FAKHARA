import { connectDatabase, disconnectDatabase } from "./config/db.js";
import env from "./config/env.js";
import { createApp } from "./app.js";
import { seedDatabase } from "./utils/seed.js";
import migrateLegacyData from "./utils/migrateLegacyData.js";

let server = null;
let shuttingDown = false;

async function start() {
  await connectDatabase();
  await seedDatabase();
  await migrateLegacyData();

  const app = createApp();

  server = app.listen(env.port, env.host, () => {
    console.log(
      `FAKHARA API listening on http://localhost:${env.port} (${env.nodeEnv}).`
    );
  });
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

start().catch((error) => {
  console.error("Could not start FAKHARA API:", error);
  process.exit(1);
});
