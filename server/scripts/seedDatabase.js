import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { seedDatabase } from "../utils/seed.js";
import migrateLegacyData from "../utils/migrateLegacyData.js";

/**
 * Initializes the FAKHARA database:
 *  - imports the real products and categories from src/data/products.js
 *  - creates the administrator account from the .env variables
 *  - migrates any legacy SQLite data that has not been imported yet
 *
 * The script is safe to run several times: nothing is duplicated.
 */
async function main() {
  await connectDatabase();
  await seedDatabase();
  await migrateLegacyData();

  console.log("Database initialization complete.");
}

main()
  .catch((error) => {
    console.error("Could not initialize the FAKHARA database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
