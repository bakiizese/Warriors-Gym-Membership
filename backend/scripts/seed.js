// Usage: node scripts/seed.js [--reset]
//   (no flag)  seed only if the database has no admin yet
//   --reset    wipe every table, then seed
import sequelize from "../config/database.js";
import { migrator } from "../config/migrator.js";
import { demoAccounts } from "../config/demo.js";
import { seedDemoData } from "../services/seed.js";

const reset = process.argv.includes("--reset");

try {
  await migrator.up();
  const result = await seedDemoData({ reset });
  if (!result.seeded) {
    console.log("database already has data; use --reset to wipe and reseed");
  } else {
    console.log("seeded:", result);
    console.log(`admin  ${demoAccounts.admin.phone} / ${demoAccounts.admin.password}`);
    console.log(`member ${demoAccounts.member.phone} / ${demoAccounts.member.password}`);
  }
} catch (err) {
  console.error("seed failed", err);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
