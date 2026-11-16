import Admin from "../models/Admin.js";
import env from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * Safety rules:
 *  - the password is supplied through the environment (never hardcoded);
 *  - it must contain at least 12 characters;
 *  - an existing administrator is never modified unless
 *    ADMIN_RESET_PASSWORD=true is explicitly set.
 */
async function seedAdmin() {
  if (!env.adminEmail || !env.adminPassword) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running npm run seed:admin."
    );
    process.exitCode = 1;
    return;
  }

  if (env.adminPassword.length < 12) {
    console.error("ADMIN_PASSWORD must contain at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  await connectDatabase();

  try {
    const existing = await Admin.findOne({ email: env.adminEmail });
    const allowReset =
      process.argv.includes("--reset") ||
      process.env.ADMIN_RESET_PASSWORD === "true";

    if (existing && !allowReset) {
      console.log(
        `Administrator already exists (${existing.email}). No changes made.\n` +
          "To set a new password: update ADMIN_PASSWORD in server/.env, then run `npm run admin:reset`."
      );
      return;
    }

    const admin =
      existing ||
      new Admin({
        name: env.adminName,
        email: env.adminEmail,
        role: "superadmin",
      });

    admin.name = env.adminName;
    admin.isActive = true;
    await admin.setPassword(env.adminPassword);
    await admin.save();

    console.log(
      existing
        ? `Administrator password updated: ${admin.email}`
        : `Administrator created: ${admin.email}`
    );
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin().catch((error) => {
  console.error("Could not create administrator:", error);
  process.exitCode = 1;
});
