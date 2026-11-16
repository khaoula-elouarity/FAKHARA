import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import env from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";

/**
 * Read-only diagnostic for administrator access.
 *
 * It never prints the password or its hash: it only reports whether the
 * account exists, is active, and whether the password in server/.env matches
 * the bcrypt hash stored in MongoDB.
 *
 * Usage: npm run admin:check
 */
async function main() {
  await connectDatabase();

  const targetEmail = String(env.adminEmail || "").toLowerCase().trim();
  const total = await Admin.countDocuments();
  const admins = await Admin.find({}).select("+passwordHash").lean();
  const admin = admins.find((item) => item.email === targetEmail);

  console.log("\nFAKHARA administrator diagnostic");
  console.log(`Database:      ${env.mongoDbName}`);
  console.log(`Admin total:   ${total}`);
  console.log(
    `Configured:    ${targetEmail || "(ADMIN_EMAIL is empty)"}`
  );

  if (!targetEmail) {
    console.error("\nADMIN_EMAIL is missing from server/.env.");
    process.exitCode = 1;
    return;
  }

  if (!admin) {
    console.error(
      `\nNo administrator matches ${targetEmail}. Create it with: npm run seed:admin`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Account:       found (${admin.email})`);
  console.log(`Role:          ${admin.role}`);
  console.log(`Active:        ${admin.isActive ? "yes" : "no"}`);

  const hashLooksValid = /^\$2[aby]\$\d{2}\$/.test(admin.passwordHash || "");
  console.log(
    `Password hash: ${hashLooksValid ? "valid bcrypt hash" : "MISSING OR INVALID"}`
  );

  if (!env.adminPassword) {
    console.error("\nADMIN_PASSWORD is missing from server/.env.");
    process.exitCode = 1;
    return;
  }

  const matches = hashLooksValid
    ? await bcrypt.compare(env.adminPassword, admin.passwordHash)
    : false;

  console.log(
    `Password:      ${matches ? "matches ADMIN_PASSWORD" : "DOES NOT match ADMIN_PASSWORD"}`
  );

  if (!admin.isActive || !matches) {
    console.error(
      "\nAdministrator is not usable with the current server/.env.\n" +
        "Set the desired ADMIN_PASSWORD (12+ characters) and run: npm run admin:reset"
    );
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Administrator check failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
